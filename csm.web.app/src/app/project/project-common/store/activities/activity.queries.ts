/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    select,
    Store
} from '@ngrx/store';
import {Observable} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {BaseQueries} from '../../../../shared/misc/store/base.queries';
import {ActivityResource} from '../../api/activities/resources/activity.resource';
import {ActivityListResourceLinks} from '../../api/activities/resources/activity-list.resource';
import {ActivitySlice} from './activity.slice';

@Injectable({
    providedIn: 'root',
})
export class ActivityQueries extends BaseQueries<ActivityResource, ActivitySlice, ActivityListResourceLinks> {

    public moduleName = 'projectModule';

    public sliceName = 'activitySlice';

    constructor(private _store: Store<State>) {
        super();
    }

    /**
     * @description Retrieves Observable of current task activities
     */
    public observeActivities(): Observable<ActivityResource[]> {
        return this._store
            .pipe(
                select(this.getList()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of current task activities request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeActivitiesRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getListRequestStatus()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of current task activities has more items
     * @returns {Observable<boolean>}
     */
    public observeActivitiesHasMoreItems(): Observable<boolean> {
        return this._store
            .pipe(
                select(this.getListHasMoreItems()),
                distinctUntilChanged());
    }
}
