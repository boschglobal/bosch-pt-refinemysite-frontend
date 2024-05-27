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
import {isEqual} from 'lodash';
import * as moment from 'moment';
import {Observable} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';

import {State} from '../../../app.reducers';
import {RequestStatusEnum} from '../../misc/enums/request-status.enum';
import {BaseQueries} from '../../misc/store/base.queries';
import {NotificationResource} from '../api/resources/notification.resource';
import {NotificationListLinks} from '../api/resources/notification-list.resource';
import {NotificationSlice} from './notification.slice';

@Injectable({
    providedIn: 'root',
})
export class NotificationQueries extends BaseQueries<NotificationResource, NotificationSlice, NotificationListLinks> {

    public sliceName = 'notificationSlice';

    constructor(private _store: Store<State>) {
        super();
    }

    /**
     * @description Retrieves Observable of notifications
     * @returns {Observable<NotificationResource[]>}
     */
    public observeNotifications(): Observable<NotificationResource[]> {
        return this._store
            .pipe(
                select(this.getList()),
                distinctUntilChanged(isEqual));
    }

    /**
     * @description Retrieves Observable of notifications request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeNotificationsRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getListRequestStatus()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of notifications has more items
     * @returns {Observable<boolean>}
     */
    public observeNotificationsHasMoreItems(): Observable<boolean> {
        return this._store
            .pipe(
                select(this.getListHasMoreItems()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of notifications has new items
     * @returns {Observable<boolean>}
     */
    public observeNotificationsHasNewItems(): Observable<boolean> {
        return this._store
            .pipe(
                select(this.hasNewItems()),
                distinctUntilChanged());
    }

    public hasNewItems(): (state: State) => boolean {
        return (state: State) => {
            const {lastAdded, lastSeen} = this._getSlice(state).list;

            return this.isDateNotSeen(lastAdded, lastSeen);
        };
    }

    public isDateNotSeen(date: string, lastSeen: string):  boolean {
        return (date && !lastSeen) || moment(date).isAfter(moment(lastSeen));
    }
}
