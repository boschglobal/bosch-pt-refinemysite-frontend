/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    Actions,
    createEffect,
    ofType
} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {
    chunk,
    flatten,
    groupBy,
    isEqual,
    uniq,
    uniqWith,
} from 'lodash';
import {
    combineLatest,
    Observable,
    of,
    zip,
} from 'rxjs';
import {
    buffer,
    catchError,
    debounceTime,
    filter,
    first,
    map,
    mergeMap,
    switchMap,
    withLatestFrom,
} from 'rxjs/operators';

import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectIdentifierPairWithVersion} from '../../../../shared/misc/api/datatypes/object-identifier-pair-with-version.datatype';
import {AbstractItemsResource} from '../../../../shared/misc/api/resources/abstract-items.resource';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RealtimeService} from '../../../../shared/realtime/api/realtime.service';
import {RealtimeEventUpdateDataResource} from '../../../../shared/realtime/api/resources/realtime-event-update-data.resource';
import {EventTypeEnum} from '../../../../shared/realtime/enums/event-type.enum';
import {RealtimeQueries} from '../../../../shared/realtime/store/realtime.queries';
import {RelationService} from '../../api/relations/relation.service';
import {RelationResource} from '../../api/relations/resources/relation.resource';
import {RelationListResource} from '../../api/relations/resources/relation-list.resource';
import {SaveRelationFilters} from '../../api/relations/resources/save-relation-filters';
import {RelationTypeEnum} from '../../enums/relation-type.enum';
import {
    MilestoneActionEnum,
    MilestoneActions,
} from '../milestones/milestone.actions';
import {ProjectSliceService} from '../projects/project-slice.service';
import {
    ProjectTaskActions,
    TaskActionEnum,
} from '../tasks/task.actions';
import {
    RelationActionEnum,
    RelationActions
} from './relation.actions';
import {RelationQueries} from './relation.queries';

export const RELATION_UPDATE_EVENTS_DEBOUNCE_TIME = 1000;

export const TRIGGER_REQUEST_CALENDAR_RELATIONS_ACTIONS_BUFFER_TIME = 500;

const TRIGGER_REQUEST_CALENDAR_RELATIONS_ACTIONS: string[] = [
    TaskActionEnum.RequestAllCalendarFulfilled,
    MilestoneActionEnum.RequestAllFulfilled,
];

const TRIGGER_REQUEST_CALENDAR_RELATIONS_PAYLOAD_MAP: { [key: string]: (action: Action) => ObjectIdentifierPair[] } = {
    [TaskActionEnum.RequestAllCalendarFulfilled]: (action: ProjectTaskActions.Request.AllCalendarFulfilled) =>
        action.payload.tasks.map(task => new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id)),
    [MilestoneActionEnum.RequestAllFulfilled]: (action: MilestoneActions.Request.AllFulfilled) =>
        action.list.items.map(milestone => new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestone.id)),
};

const RELATION_CRITICALITY_REALTIME_EVENTS: EventTypeEnum[] = [
    EventTypeEnum.Critical,
    EventTypeEnum.Uncritical,
];

const REQUEST_ALL_BY_IDS_ACTIONS = {
    [ObjectTypeEnum.Task]: (taskIds: string[]): Action => new ProjectTaskActions.Request.AllByIds(taskIds),
    [ObjectTypeEnum.Milestone]: (milestoneIds: string[]): Action => new MilestoneActions.Request.AllByIds(milestoneIds),
};

@Injectable()
export class RelationEffects {

    /**
     * @description Stream of events filtered for the current context
     * @description Since the backend does not offer a subscription mechanism, we receive all the events and we have to filter them
     */
    private _updateEventsForCurrentContext$: Observable<RealtimeEventUpdateDataResource> = this._realtimeService.getUpdateEvents()
        .pipe(
            withLatestFrom(this._realtimeQueries.observeContext()),
            filter(([data, context]) => context && data.root.isSame(context)),
            map(([data]) => data),
        );

    private _filteredRelationCreateAndUpdateEvents$: Observable<RealtimeEventUpdateDataResource> = this._updateEventsForCurrentContext$
        .pipe(
            filter((data: RealtimeEventUpdateDataResource) => data.object.type === ObjectTypeEnum.Relation),
            filter((data: RealtimeEventUpdateDataResource) => data.event === EventTypeEnum.Created || data.event === EventTypeEnum.Updated),
            mergeMap((data: RealtimeEventUpdateDataResource) => this._combineEventDataWithRelation(data)),
            filter(([data, relation]) => !relation || data.object.version > relation.version),
            map(([data]) => data),
        );

    private _filteredRelationCriticalityEvents$: Observable<[RealtimeEventUpdateDataResource, RelationResource | undefined]> =
        this._updateEventsForCurrentContext$.pipe(
            filter((data: RealtimeEventUpdateDataResource) => data.object.type === ObjectTypeEnum.Relation),
            filter((data: RealtimeEventUpdateDataResource) => RELATION_CRITICALITY_REALTIME_EVENTS.includes(data.event)),
            mergeMap((data: RealtimeEventUpdateDataResource) => this._combineEventDataWithRelation(data)),
            filter(([data, relation]) => !relation || data.object.version > relation.version),
        );

    private _triggerRequestCalendarRelationsEvents: Observable<Action> = this._actions$
        .pipe(
            ofType(...TRIGGER_REQUEST_CALENDAR_RELATIONS_ACTIONS)
        );

    constructor(private _actions$: Actions,
                private _projectSliceService: ProjectSliceService,
                private _realtimeQueries: RealtimeQueries,
                private _realtimeService: RealtimeService,
                private _relationQueries: RelationQueries,
                private _relationService: RelationService) {
    }

    public relationUpdateAndCreateEvents$: Observable<Action> = createEffect(() => this._filteredRelationCreateAndUpdateEvents$
        .pipe(
            buffer(this._filteredRelationCreateAndUpdateEvents$.pipe(debounceTime(RELATION_UPDATE_EVENTS_DEBOUNCE_TIME))),
            map((data: RealtimeEventUpdateDataResource[]) => uniq(data.map(item => item.object.id))),
            map(data => new RelationActions.Request.AllByIds(data, true)),
        ));

    public relationCriticalityEvents$: Observable<Action> = createEffect(() => this._filteredRelationCriticalityEvents$
        .pipe(
            buffer(this._filteredRelationCriticalityEvents$.pipe(debounceTime(RELATION_UPDATE_EVENTS_DEBOUNCE_TIME))),
            mergeMap((data: [RealtimeEventUpdateDataResource, RelationResource | undefined][]) => {
                const requestRelations: string[] = [];
                const criticalRelations: ObjectIdentifierPairWithVersion[] = [];
                const uncriticalRelations: ObjectIdentifierPairWithVersion[] = [];

                data.forEach(([{event, object}, relation]) => {
                    if (!relation || object.version > relation.version + 1) {
                        requestRelations.push(object.id);
                    } else if (event === EventTypeEnum.Critical) {
                        criticalRelations.push(object);
                    } else {
                        uncriticalRelations.push(object);
                    }
                });

                return [
                    ...requestRelations.length ? [new RelationActions.Request.AllByIds(requestRelations)] : [],
                    ...criticalRelations.length ? [new RelationActions.Set.AllCritical(criticalRelations)] : [],
                    ...uncriticalRelations.length ? [new RelationActions.Set.AllUncritical(uncriticalRelations)] : [],
                ];
            }),
        ));

    public relationDeleteEvents$: Observable<Action> = createEffect(() => this._updateEventsForCurrentContext$
        .pipe(
            filter((data: RealtimeEventUpdateDataResource) => data.object.type === ObjectTypeEnum.Relation),
            filter((data: RealtimeEventUpdateDataResource) => data.event === EventTypeEnum.Deleted),
            map((data: RealtimeEventUpdateDataResource) => new RelationActions.Delete.OneFulfilled(data.object.id)),
        ));

    public requestAllRelationsResources = createEffect(() => this._actions$
        .pipe(
            ofType(
                RelationActionEnum.RequestAllFulfilled,
                RelationActionEnum.RequestAllByIdsFulfilled,
            ),
            filter((action: RelationActions.Request.AllFulfilled | RelationActions.Request.AllByIdsFulfilled) => action.withResources),
            mergeMap((action: RelationActions.Request.AllFulfilled | RelationActions.Request.AllByIdsFulfilled) => {
                const elements: ObjectIdentifierPair[] = [
                    ...action.list.items.map(item => item.source),
                    ...action.list.items.map(item => item.target),
                ];
                const groupedElementsByType = groupBy(elements, 'type');

                return Object.keys(groupedElementsByType)
                    .filter(objectType => REQUEST_ALL_BY_IDS_ACTIONS.hasOwnProperty(objectType))
                    .map(objectType => {
                        const ids = uniq(groupedElementsByType[objectType].map(item => item.id));

                        return REQUEST_ALL_BY_IDS_ACTIONS[objectType](ids);
                    });
            })));

    public triggerRequestCalendarRelations$: Observable<Action> = createEffect(() => this._triggerRequestCalendarRelationsEvents
        .pipe(
            buffer(
                this._triggerRequestCalendarRelationsEvents.pipe(debounceTime(TRIGGER_REQUEST_CALENDAR_RELATIONS_ACTIONS_BUFFER_TIME))
            ),
            map((actions: Action[]) => {
                const elements = uniqWith(flatten(actions
                    .map(action => TRIGGER_REQUEST_CALENDAR_RELATIONS_PAYLOAD_MAP[action.type](action))), isEqual);

                return SaveRelationFilters.forFinishToStartRelationsBySourcesAndTargets(elements, elements);
            }),
            filter((filters: SaveRelationFilters) => !!filters.targets.length || !!filters.sources.length),
            map((filters: SaveRelationFilters) => new RelationActions.Request.All(filters)),
        ));

    public requestAll$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(RelationActionEnum.RequestAll),
            withLatestFrom(
                this._projectSliceService.observeCurrentProjectId(),
            ),
            mergeMap(([action, projectId]: [RelationActions.Request.All, string]) => {
                const pageNumber = 0;
                const pageSize = 100;

                return this._relationService.findAll(projectId, pageNumber, pageSize, action.payload)
                    .pipe(
                        switchMap((relationList: RelationListResource) => {
                            const requests = [of(relationList)];

                            for (let page = pageNumber + 1; page < relationList.totalPages; page++) {
                                requests.push(this._relationService.findAll(projectId, page, pageSize, action.payload));
                            }

                            return zip(...requests);
                        }),
                        map((relationLists: RelationListResource[]) => {
                            const items = relationLists.map(relationList => relationList.items);
                            return Object.assign({}, relationLists[0], {items: flatten(items)});
                        }),
                        map((relationList: RelationListResource) =>
                            new RelationActions.Request.AllFulfilled(relationList, action.withResources)),
                        catchError(() => of(new RelationActions.Request.AllRejected())));
            })));

    public requestAllByIds$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(RelationActionEnum.RequestAllByIds),
            withLatestFrom(this._projectSliceService.observeCurrentProjectId()),
            mergeMap(([action, projectId]: [RelationActions.Request.AllByIds, string]) => {
                const requests = chunk(action.ids, 100)
                    .map(ids => this._relationService.findAllByIds(projectId, ids));

                return zip(...requests)
                    .pipe(
                        map((abstractLists: AbstractItemsResource<RelationResource>[]) => {
                            const items = abstractLists.map(relationList => relationList.items);

                            return Object.assign(new AbstractItemsResource<RelationResource>(), abstractLists[0], {items: flatten(items)});
                        }),
                        map((abstractList: AbstractItemsResource<RelationResource>) =>
                            new RelationActions.Request.AllByIdsFulfilled(abstractList, action.withResources)),
                        catchError(() => of(new RelationActions.Request.AllByIdsRejected())),
                    );
            })
        )
    );

    public createAll$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(RelationActionEnum.CreateAll),
            withLatestFrom(
                this._projectSliceService.observeCurrentProjectId(),
            ),
            switchMap(([action, projectId]: [RelationActions.Create.All, string]) =>
                this._relationService.createAll(projectId, action.items)
                    .pipe(
                        mergeMap((relationList: RelationResource[]) => [
                            new RelationActions.Create.AllFulfilled(relationList),
                            new AlertActions.Add.SuccessAlert(
                                {message: new AlertMessageResource(action.successMessageKey)}),
                        ]),
                        catchError(() => {
                                const relationTypes: RelationTypeEnum[] = uniq(action.items.map(item => item.type));

                                return of(new RelationActions.Create.AllRejected(relationTypes));
                            }
                        )))));

    public deleteOne$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(RelationActionEnum.DeleteOne),
            withLatestFrom(
                this._projectSliceService.observeCurrentProjectId(),
            ),
            switchMap(([action, projectId]: [RelationActions.Delete.One, string]) =>
                this._relationService.delete(projectId, action.relationId, action.version)
                    .pipe(
                        mergeMap(() => [
                            new RelationActions.Delete.OneFulfilled(action.relationId),
                            new AlertActions.Add.SuccessAlert(
                                {message: new AlertMessageResource(action.successMessageKey)}),
                        ]),
                        catchError(() => of(new RelationActions.Delete.OneRejected(action.relationId)))))));

    private _combineEventDataWithRelation(data: RealtimeEventUpdateDataResource):
        Observable<[RealtimeEventUpdateDataResource, RelationResource]> {
        return combineLatest([
            of(data),
            this._relationQueries.observeRelationById(data.object.id),
        ]).pipe(first());
    }
}

