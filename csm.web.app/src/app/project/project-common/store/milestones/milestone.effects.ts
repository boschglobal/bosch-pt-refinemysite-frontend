/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
    flatten
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
    withLatestFrom
} from 'rxjs/operators';

import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {HTTP_GET_REQUEST_DEBOUNCE_TIME} from '../../../../shared/misc/store/constants/effects.constants';
import {RealtimeService} from '../../../../shared/realtime/api/realtime.service';
import {RealtimeEventUpdateDataResource} from '../../../../shared/realtime/api/resources/realtime-event-update-data.resource';
import {EventTypeEnum} from '../../../../shared/realtime/enums/event-type.enum';
import {RealtimeQueries} from '../../../../shared/realtime/store/realtime.queries';
import {MilestoneService} from '../../api/milestones/milestone.service';
import {MilestoneResource} from '../../api/milestones/resources/milestone.resource';
import {MilestoneListResource} from '../../api/milestones/resources/milestone-list.resource';
import {SaveMilestoneFilters} from '../../api/milestones/resources/save-milestone-filters';
import {CalendarScopeActionEnum} from '../calendar/calendar-scope/calendar-scope.actions';
import {CalendarScopeQueries} from '../calendar/calendar-scope/calendar-scope.queries';
import {ProjectSliceService} from '../projects/project-slice.service';
import {
    MilestoneActionEnum,
    MilestoneActions
} from './milestone.actions';
import {MilestoneQueries} from './milestone.queries';
import {MilestoneFilters} from './slice/milestone-filters';

export const MILESTONE_UPDATE_EVENTS_DEBOUNCE_TIME = 1000;

const MILESTONE_LIST_UPDATE_EVENTS: EventTypeEnum[] = [
    EventTypeEnum.ItemAdded,
    EventTypeEnum.ItemRemoved,
    EventTypeEnum.Reordered,
];

const TRIGGER_REQUEST_ALL_ACTIONS: string[] = [
    MilestoneActionEnum.SetFilters,
    CalendarScopeActionEnum.SetScopeParameters,
    CalendarScopeActionEnum.SetStart,
    CalendarScopeActionEnum.SetMode,
];

@Injectable()
export class MilestoneEffects {

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

    private _filteredMilestoneUpdateEvents$: Observable<RealtimeEventUpdateDataResource> = this._updateEventsForCurrentContext$
        .pipe(
            filter((data: RealtimeEventUpdateDataResource) => data.object.type === ObjectTypeEnum.Milestone),
            filter((data: RealtimeEventUpdateDataResource) => data.event === EventTypeEnum.Updated || data.event === EventTypeEnum.Created),
            mergeMap((data: RealtimeEventUpdateDataResource) =>
                combineLatest([
                    of(data),
                    this._milestoneQueries.observeMilestoneById(data.object.id),
                ]).pipe(first())),
            filter(([data, milestone]) => !milestone || (milestone && data.object.version > milestone.version)),
            map(([data]) => data));

    private _filteredMilestoneListUpdateEvents$: Observable<RealtimeEventUpdateDataResource> = this._updateEventsForCurrentContext$
        .pipe(
            filter((data: RealtimeEventUpdateDataResource) => data.object.type === ObjectTypeEnum.MilestoneList),
            filter((data: RealtimeEventUpdateDataResource) => MILESTONE_LIST_UPDATE_EVENTS.includes(data.event)),
        );

    constructor(private _actions$: Actions,
                private _calendarScopeQueries: CalendarScopeQueries,
                private _milestoneQueries: MilestoneQueries,
                private _milestoneService: MilestoneService,
                private _projectSliceService: ProjectSliceService,
                private _realtimeQueries: RealtimeQueries,
                private _realtimeService: RealtimeService) {
    }

    public milestoneUpdateAndCreateEvents$: Observable<Action> = createEffect(() => this._filteredMilestoneUpdateEvents$
        .pipe(
            buffer(this._filteredMilestoneUpdateEvents$.pipe(debounceTime(MILESTONE_UPDATE_EVENTS_DEBOUNCE_TIME))),
            map((data: RealtimeEventUpdateDataResource[]) => data.map(({object: {id}}) => id)),
            switchMap((ids: string[]) => of(new MilestoneActions.Request.AllByIds(ids))),
        ));

    public milestoneDeleteEvents$: Observable<Action> = createEffect(() => this._updateEventsForCurrentContext$
        .pipe(
            filter((data: RealtimeEventUpdateDataResource) => data.object.type === ObjectTypeEnum.Milestone),
            filter((data: RealtimeEventUpdateDataResource) => data.event === EventTypeEnum.Deleted),
            switchMap((data: RealtimeEventUpdateDataResource) => of(new MilestoneActions.Delete.OneFulfilled(data.object.id))),
        ));

    public milestoneListUpdateEvents$: Observable<Action> = createEffect(() => this._filteredMilestoneListUpdateEvents$
        .pipe(
            buffer(this._filteredMilestoneListUpdateEvents$.pipe(debounceTime(MILESTONE_UPDATE_EVENTS_DEBOUNCE_TIME))),
            map((data: RealtimeEventUpdateDataResource[]) => data.map(({object: {id}}) => id)),
            switchMap((ids: string[]) => of(new MilestoneActions.Request.AllByMilestoneListIds(ids))),
        ));

    /**
     * @description Global interceptor for milestone requests
     * @type {Observable<Action>}
     */
    public triggerRequestAllActions$ = createEffect(() => this._actions$
        .pipe(
            ofType(...TRIGGER_REQUEST_ALL_ACTIONS),
            debounceTime(HTTP_GET_REQUEST_DEBOUNCE_TIME),
            switchMap(() => of(new MilestoneActions.Request.All()))));

    /**
     * @description Request one milestone interceptor
     * @type {Observable<Action>}
     */
    public requestOne$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(MilestoneActionEnum.RequestOne),
            switchMap((action: MilestoneActions.Request.One) =>
                this._milestoneService
                    .findOne(action.itemId)
                    .pipe(
                        map((milestone: MilestoneResource) => new MilestoneActions.Request.OneFulfilled(milestone)),
                        catchError(() => of(new MilestoneActions.Request.OneRejected()))))));

    /**
     * @description Initialize all the milestones
     * @type {Observable<Action>}
     */
    public initializeList$ = createEffect(() => this._actions$
        .pipe(
            ofType(MilestoneActionEnum.RequestAll),
            withLatestFrom(this._milestoneQueries.observeFilters()),
            filter(([, milestoneFilters]) => !milestoneFilters.useCriteria && !milestoneFilters.highlight),
            switchMap(() => of(new MilestoneActions.Initialize.List()))));

    /**
     * @description Request all milestones interceptor
     * @type {Observable<Action>}
     */
    public requestAll$ = createEffect(() => this._actions$
        .pipe(
            ofType(MilestoneActionEnum.RequestAll),
            withLatestFrom(
                this._projectSliceService.observeCurrentProjectId(),
                this._calendarScopeQueries.observeMilestoneFiltersWithTruncatedDates(),
                this._calendarScopeQueries.observeDefaultMilestoneFiltersWithTruncatedDates(),
            ),
            filter(([, , milestoneFilters]) => milestoneFilters.useCriteria || milestoneFilters.highlight),
            mergeMap(([, projectId, milestoneFilters, defaultMilestoneFilters]) => {
                const pageNumber = 0;
                const pageSize = 100;
                const filtersToUse = milestoneFilters.highlight ? defaultMilestoneFilters : milestoneFilters;
                const filters: SaveMilestoneFilters = SaveMilestoneFilters.fromMilestoneFilters(filtersToUse);

                return this._milestoneService
                    .findAll(projectId, pageNumber, pageSize, filters)
                    .pipe(
                        switchMap((milestoneList: MilestoneListResource) => {
                            const requests = [of(milestoneList)];

                            for (let page = pageNumber + 1; page < milestoneList.totalPages; page++) {
                                requests.push(this._milestoneService.findAll(projectId, page, pageSize, filters));
                            }

                            return zip(...requests);
                        }),
                        map((milestoneLists: MilestoneListResource[]) => {
                            const items = milestoneLists.map(milestoneList => milestoneList.items);
                            return Object.assign({}, milestoneLists[0], {items: flatten(items)});
                        }),
                        map((milestoneList: MilestoneListResource) => new MilestoneActions.Request.AllFulfilled(milestoneList)),
                        catchError(() => of(new MilestoneActions.Request.AllRejected())));
            })));

    /**
     * @description Request all milestones by ids interceptor
     * @type {Observable<Action>}
     */
    public requestAllByIds$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(MilestoneActionEnum.RequestAllByIds),
            withLatestFrom(
                this._projectSliceService.observeCurrentProjectId(),
            ),
            mergeMap(([action, projectId]: [MilestoneActions.Request.AllByIds, string]) => {
                const requests = chunk(action.ids, 100)
                    .map(ids => this._milestoneService.findAllByIds(projectId, ids));

                return zip(...requests)
                    .pipe(
                        map((milestoneList: MilestoneResource[][]) => flatten(milestoneList)),
                        map((milestoneList: MilestoneResource[]) => new MilestoneActions.Request.AllByIdsFulfilled(milestoneList)),
                        catchError(() => of(new MilestoneActions.Request.AllByIdsRejected())));
            })
        )
    );

    public requestAllByMilestoneListIds$ = createEffect(() => this._actions$
        .pipe(
            ofType(MilestoneActionEnum.RequestAllByMilestoneListIds),
            withLatestFrom(this._projectSliceService.observeCurrentProjectId()),
            mergeMap(([{milestoneListIds}, projectId]: [MilestoneActions.Request.AllByMilestoneListIds, string]) => {
                const pageNumber = 0;
                const pageSize = 100;
                const requests = chunk(milestoneListIds, 500)
                    .map(ids => {
                        const filters = SaveMilestoneFilters.fromMilestoneFilters(new MilestoneFilters(), ids);

                        return this._milestoneService
                            .findAll(projectId, pageNumber, pageSize, filters)
                            .pipe(
                                switchMap((milestoneList: MilestoneListResource) => {
                                    const pageRequests = [of(milestoneList)];

                                    for (let page = pageNumber + 1; page < milestoneList.totalPages; page++) {
                                        pageRequests.push(this._milestoneService.findAll(projectId, page, pageSize, filters));
                                    }

                                    return zip(...pageRequests);
                                }),
                                map((milestoneLists: MilestoneListResource[]) => flatten(milestoneLists.map(({items}) => items))),
                            );
                    });

                return zip(...requests)
                    .pipe(
                        map((milestoneLists: MilestoneResource[][]) => flatten(milestoneLists)),
                        map((items: MilestoneResource[]) => new MilestoneActions.Request.AllByMilestoneListIdsFulfilled(items)),
                        catchError(() => of(new MilestoneActions.Request.AllByMilestoneListIdsRejected())));
            })));

    /**
     * @description Create milestone interceptor
     * @type {Observable<Action>}
     */
    public create$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(MilestoneActionEnum.CreateOne),
            switchMap((action: MilestoneActions.Create.One) =>
                this._milestoneService
                    .create(action.item)
                    .pipe(
                        mergeMap((milestone: MilestoneResource) => [
                            new MilestoneActions.Create.OneFulfilled(milestone),
                            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Milestone_Create_SuccessMessage')}),
                        ]),
                        catchError(() => of(new MilestoneActions.Create.OneRejected()))))));

    /**
     * @description Delete milestone interceptor
     * @type {Observable<Action>}
     */
    public delete$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(MilestoneActionEnum.DeleteOne),
            switchMap(action => {
                const {itemId, version} = action;

                return this._milestoneService
                    .delete(itemId, version)
                    .pipe(
                        mergeMap(() => [
                            new MilestoneActions.Delete.OneFulfilled(itemId),
                            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Milestone_Delete_SuccessMessage')}),
                        ]),
                        catchError(() => of(new MilestoneActions.Delete.OneRejected())));
            })));

    /**
     * @description Update milestone interceptor
     * @type {Observable<Action>}
     */
    public update$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(MilestoneActionEnum.UpdateOne),
            switchMap(action => {
                const {itemId, item, version} = action;

                return this._milestoneService
                    .update(itemId, item, version)
                    .pipe(
                        mergeMap((milestoneResource: MilestoneResource) => [
                            new MilestoneActions.Update.OneFulfilled(milestoneResource),
                            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Milestone_Update_SuccessMessage')}),
                        ]),
                        catchError(() => of(new MilestoneActions.Update.OneRejected())));
            })));
}
