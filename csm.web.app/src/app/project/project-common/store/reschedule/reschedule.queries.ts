/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */
import {Injectable} from '@angular/core';
import {
    select,
    Store
} from '@ngrx/store';
import {
    combineLatest,
    iif,
    Observable,
    of
} from 'rxjs';
import {
    distinctUntilChanged,
    filter,
    map,
    switchMap
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {BaseQueries} from '../../../../shared/misc/store/base.queries';
import {RescheduleResource} from '../../api/reschedule/resources/reschedule.resource';
import {Milestone} from '../../models/milestones/milestone';
import {Reschedule} from '../../models/reschedule/reschedule';
import {Task} from '../../models/tasks/task';
import {MilestoneQueries} from '../milestones/milestone.queries';
import {ProjectTaskQueries} from '../tasks/task-queries';
import {RescheduleSlice} from './reschedule.slice';

@Injectable({
    providedIn: 'root',
})
export class RescheduleQueries extends BaseQueries<RescheduleResource, RescheduleSlice> {

    public moduleName = 'projectModule';

    public sliceName = 'rescheduleSlice';

    constructor(
        private _milestoneQueries: MilestoneQueries,
        private _store: Store<State>,
        private _taskQueries: ProjectTaskQueries
    ) {
        super();
    }

    public observeRequestStatus(): Observable<RequestStatusEnum> {
        return this._store.pipe(
            select(this.getSlice()),
            map(slice => slice.requestStatus),
            distinctUntilChanged(),
        );
    }

    public observeRescheduleWithResources(): Observable<Reschedule> {
        return this._store.pipe(
            select(this.getSlice()),
            map(slice => slice.item),
            filter(item => !!item),
            switchMap((item: RescheduleResource) =>
                combineLatest([
                    this._resolveItems<Task>(item.failed.tasks,
                        id => this._taskQueries.observeTaskById(id).pipe(filter(task => !!task.schedule))),
                    this._resolveItems<Milestone>(item.failed.milestones, id => this._milestoneQueries.observeMilestoneById(id)),
                ]).pipe(
                    map(([tasks, milestones]: [Task[], Milestone[]]) => Reschedule.fromRescheduleResource(item, tasks, milestones)),
                )
            )
        );
    }

    public observeCurrentItem(): Observable<RescheduleResource> {
        return this._store.pipe(
            select(this.getSlice()),
            filter(slice => !!slice?.item),
            map(slice => slice.item),
            distinctUntilChanged(),
        );
    }

    private _resolveItems<T>(itemIds: string[], queryFn: (id: string) => Observable<T>): Observable<T[]> {
        return iif(() => itemIds.length > 0,
            combineLatest(itemIds.map(id => queryFn(id))),
            of([]),
        );
    }
}
