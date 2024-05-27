/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    select,
    Store
} from '@ngrx/store';
import {isEqual} from 'lodash';
import {
    combineLatest,
    iif,
    Observable,
    of,
} from 'rxjs';
import {
    distinctUntilChanged,
    filter,
    map,
    switchMap,
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {BaseQueries} from '../../../../shared/misc/store/base.queries';
import {RelationResource} from '../../api/relations/resources/relation.resource';
import {RelationListLinks} from '../../api/relations/resources/relation-list.resource';
import {RelationTypeEnum} from '../../enums/relation-type.enum';
import {Milestone} from '../../models/milestones/milestone';
import {RelationWithResource} from '../../models/relation-with-resource/relation-with-resource';
import {Task} from '../../models/tasks/task';
import {MilestoneQueries} from '../milestones/milestone.queries';
import {ProjectTaskQueries} from '../tasks/task-queries';
import {RelationSlice} from './relation.slice';

export type RelationResourceDirection = 'source' | 'target';

@Injectable({
    providedIn: 'root',
})
export class RelationQueries extends BaseQueries<RelationResource, RelationSlice, RelationListLinks> {
    public moduleName = 'projectModule';

    public sliceName = 'relationSlice';

    private _resourceObservables: { [key in ObjectTypeEnum]?: (id: string) => Observable<Task | Milestone> } = {
        [ObjectTypeEnum.Task]: (taskId: string): Observable<Task> => this._taskQueries.observeTaskById(taskId)
            .pipe(filter(task => !!task.schedule)),
        [ObjectTypeEnum.Milestone]: (milestoneId: string): Observable<Milestone> => this._milestoneQueries.observeMilestoneById(milestoneId)
            .pipe(filter(milestone => !!milestone)),
    };

    constructor(private _milestoneQueries: MilestoneQueries,
                private _store: Store<State>,
                private _taskQueries: ProjectTaskQueries) {
        super();
    }

    public observeRelationById(itemId: string): Observable<RelationResource> {
        return this._store
            .pipe(
                select(this.getItemById(itemId)),
                distinctUntilChanged(isEqual),
            );
    }

    public observePartOfRelationsByMilestoneId(milestoneId: string): Observable<RelationResource[]> {
        return this._store
            .pipe(
                select(this.getItemsByParent(RelationTypeEnum.PartOf)),
                map((relations: RelationResource[]) => relations.filter(relation => relation.target.id === milestoneId)),
                distinctUntilChanged(RelationResource.isEqualArray));
    }

    public observePartOfRelationsByTaskId(taskId: string): Observable<RelationResource[]> {
        return this._store
            .pipe(
                select(this.getItemsByParent(RelationTypeEnum.PartOf)),
                map((relations: RelationResource[]) => relations.filter(relation => relation.source.id === taskId)),
                distinctUntilChanged(RelationResource.isEqualArray));
    }

    public observePartOfRelationsRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getListRequestStatusByParent(RelationTypeEnum.PartOf)),
                distinctUntilChanged());
    }

    public observeRelationsMilestoneSubtasksByMilestoneId(milestoneId: string): Observable<RelationWithResource<Task>[]> {
        return this.observePartOfRelationsByMilestoneId(milestoneId)
            .pipe(
                switchMap((relations: RelationResource[]) =>
                    iif(() => !!relations.length,
                        combineLatest([
                            ...relations.map(relation => this._taskQueries.observeTaskById(relation.source.id)
                                .pipe(
                                    map(task => RelationWithResource.fromRelationAndResource<Task>(task, relation, ObjectTypeEnum.Task)))),
                        ]),
                        of([]))),
                filter((taskRelations: RelationWithResource<Task>[]) =>
                    !taskRelations.length || taskRelations.every(taskRelation => !!taskRelation.resource.schedule)),
                distinctUntilChanged(isEqual),
            );
    }

    public observeRelationsTaskMilestonesByTaskId(taskId: string): Observable<Milestone[]> {
        return this.observePartOfRelationsByTaskId(taskId)
            .pipe(
                switchMap((relations: RelationResource[]) =>
                    iif(() => !!relations.length,
                        combineLatest([
                            ...relations.map(relation => this._milestoneQueries.observeMilestoneById(relation.target.id)),
                        ]),
                        of([]))),
                filter((milestones: Milestone[]) => milestones.every(milestone => !!milestone)),
                distinctUntilChanged(isEqual),
            );
    }

    public observeFinishToStartRelationsCriticalityByMilestoneId(milestoneId: string): Observable<boolean> {
        return combineLatest([
            this.observeFinishToStartPredecessorRelationsByMilestoneId(milestoneId),
            this.observeFinishToStartSuccessorRelationsByMilestoneId(milestoneId),
        ]).pipe(
            map(([predecessors, successors]) =>
                predecessors.some(relation => relation.critical) || successors.some(relation => relation.critical)),
            distinctUntilChanged()
        );
    }

    public observeCriticalRelations(): Observable<RelationResource[]> {
        return this.observeFinishToStartRelations()
            .pipe(
                map(relations => relations.filter(relation => relation.critical)));
    }

    public observeFinishToStartPredecessorRelationsByMilestoneId(milestoneId: string): Observable<RelationResource[]> {
        return this._store
            .pipe(
                select(this._getFinishToStartPredecessorRelations(ObjectTypeEnum.Milestone, milestoneId)),
                distinctUntilChanged(RelationResource.isEqualArray));
    }

    public observeFinishToStartPredecessorRelationsByTaskId(taskId: string): Observable<RelationResource[]> {
        return this._store
            .pipe(
                select(this._getFinishToStartPredecessorRelations(ObjectTypeEnum.Task, taskId)),
                distinctUntilChanged(RelationResource.isEqualArray));
    }

    public observeFinishToStartSuccessorRelationsByMilestoneId(milestoneId: string): Observable<RelationResource[]> {
        return this._store
            .pipe(
                select(this._getFinishToStartSuccessorRelations(ObjectTypeEnum.Milestone, milestoneId)),
                distinctUntilChanged(RelationResource.isEqualArray));
    }

    public observeFinishToStartSuccessorRelationsByTaskId(taskId: string): Observable<RelationResource[]> {
        return this._store
            .pipe(
                select(this._getFinishToStartSuccessorRelations(ObjectTypeEnum.Task, taskId)),
                distinctUntilChanged(RelationResource.isEqualArray));
    }

    public observeFinishToStartRelationsRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getListRequestStatusByParent(RelationTypeEnum.FinishToStart)),
                distinctUntilChanged());
    }

    public observeFinishToStartRelations(): Observable<RelationResource[]> {
        return this._store
            .pipe(
                select(this._getFinishToStartRelations()),
                distinctUntilChanged(RelationResource.isEqualArray));
    }

    public observeRelationsMilestonePredecessorsByMilestoneId(milestoneId: string): Observable<RelationWithResource<Task | Milestone>[]> {
        return this.observeFinishToStartPredecessorRelationsByMilestoneId(milestoneId)
            .pipe(
                switchMap(relations => this.observeResourcesByRelationList(relations, 'source')),
                distinctUntilChanged(isEqual),
            );
    }

    public observeRelationsTaskPredecessorsByTaskId(taskId: string): Observable<RelationWithResource<Task | Milestone>[]> {
        return this.observeFinishToStartPredecessorRelationsByTaskId(taskId)
            .pipe(
                switchMap(relations => this.observeResourcesByRelationList(relations, 'source')),
                distinctUntilChanged(isEqual),
            );
    }

    public observeRelationsMilestoneSuccessorsByMilestoneId(milestoneId: string): Observable<RelationWithResource<Task | Milestone>[]> {
        return this.observeFinishToStartSuccessorRelationsByMilestoneId(milestoneId)
            .pipe(
                switchMap(relations => this.observeResourcesByRelationList(relations, 'target')),
                distinctUntilChanged(isEqual),
            );
    }

    public observeRelationsTaskSuccessorsByTaskId(taskId: string): Observable<RelationWithResource<Task | Milestone>[]> {
        return this.observeFinishToStartSuccessorRelationsByTaskId(taskId)
            .pipe(
                switchMap(relations => this.observeResourcesByRelationList(relations, 'target')),
                distinctUntilChanged(isEqual),
            );
    }

    public observeResourcesByRelationList(relations: RelationResource[],
                                          direction: RelationResourceDirection): Observable<RelationWithResource<Task | Milestone>[]> {
        return iif(() => !!relations.length,
            combineLatest([
                ...relations
                    .filter(relation => this._resourceObservables.hasOwnProperty(relation[direction].type))
                    .map(relation => {
                        const {id, type} = relation[direction];

                        return this._resourceObservables[type](id)
                            .pipe(
                                map(resource =>
                                    RelationWithResource.fromRelationAndResource<Task | Milestone>(resource, relation, type)));
                    }),
            ]),
            of([]));
    }

    private _getFinishToStartRelations(): (state: State) => RelationResource[] {
        return (state: State) => this.getItemsByParent(RelationTypeEnum.FinishToStart)(state);
    }

    private _getFinishToStartPredecessorRelations(objectTypeEnum: ObjectTypeEnum, id: string): (state: State) => RelationResource[] {
        const objectIdentifierPair = new ObjectIdentifierPair(objectTypeEnum, id);

        return (state: State) => this.getItemsByParent(RelationTypeEnum.FinishToStart)(state)
            .filter(relation => objectIdentifierPair.isSame(relation.target));
    }

    private _getFinishToStartSuccessorRelations(objectTypeEnum: ObjectTypeEnum, id: string): (state: State) => RelationResource[] {
        const objectIdentifierPair = new ObjectIdentifierPair(objectTypeEnum, id);

        return (state: State) => this.getItemsByParent(RelationTypeEnum.FinishToStart)(state)
            .filter(relation => objectIdentifierPair.isSame(relation.source));
    }
}
