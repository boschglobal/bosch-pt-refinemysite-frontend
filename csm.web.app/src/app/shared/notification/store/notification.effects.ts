/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    Actions,
    createEffect,
    ofType
} from '@ngrx/effects';
import {
    Action,
    select,
    Store
} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {
    Observable,
    of
} from 'rxjs';
import {
    catchError,
    filter,
    map,
    mergeMap,
    switchMap,
    withLatestFrom
} from 'rxjs/operators';

import {State} from '../../../app.reducers';
import {RealtimeService} from '../../realtime/api/realtime.service';
import {RealtimeEventNotificationDataResource} from '../../realtime/api/resources/realtime-event-notification-data.resource';
import {NotificationService} from '../api/notification.service';
import {NotificationListResource} from '../api/resources/notification-list.resource';
import {
    NotificationActionEnum,
    NotificationActions
} from './notification.actions';
import {NotificationQueries} from './notification.queries';

@Injectable()
export class NotificationEffects {
    private _queries: NotificationQueries = new NotificationQueries(this._store);

    constructor(private _actions$: Actions,
                private _notificationService: NotificationService,
                private _realtimeService: RealtimeService,
                private _store: Store<State>,
                private _translateService: TranslateService) {
    }

    /**
     * @description Stream of events for notifications when language changes
     * @type {Observable<Action>}
     */
    public requestNotificationsOnLangChange$: Observable<Action> = createEffect(() => this._translateService.onDefaultLangChange
        .pipe(
            withLatestFrom(this._store.pipe(
                select(this._queries.getList())
            )),
            filter(([lang, notifications]) => !!notifications.length),
            map(() => new NotificationActions.Request.All()),
        ));

    /**
     * @description Stream of events for newly created notifications
     * @type {Observable<Action>}
     */
    public newNotifications$: Observable<Action> = createEffect(() => this._realtimeService.getNotificationEvents()
        .pipe(
            map((notificationEvent: RealtimeEventNotificationDataResource) => new NotificationActions.Set.LastAdded(notificationEvent.lastAdded)),
        ));

    /**
     * @description Request notifications interceptor to request initial list of notifications
     * @type {Observable<Action>}
     */
    public requestNotifications$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(NotificationActionEnum.RequestAll),
            withLatestFrom(this._store.pipe(
                select(this._queries.getSlice())
            )),
            switchMap(([action, slice]) => {
                return this._notificationService.findAll()
                    .pipe(
                        mergeMap((notificationList: NotificationListResource) => {
                            const actions: Action[] = [new NotificationActions.Request.AllFulfilled(notificationList)];

                            // the request return new notifications and its not the first loading (has lastAdded)
                            if (notificationList.items.length && slice.list.lastAdded) {
                                const seenDate = notificationList.items[0].date;

                                // if the date is not seen yet, then mark it has seen
                                if (this._queries.isDateNotSeen(seenDate, slice.list.lastSeen)) {
                                    actions.push(new NotificationActions.Set.AsSeen(seenDate));
                                }
                            }

                            return actions;
                        }),
                        catchError(() => of(new NotificationActions.Request.AllRejected()))
                    );
            })));

    /**
     * @description Request notifications interceptor to request latest list of notifications
     * @description As a side effect also masks the list as seen
     * @type {Observable<Action>}
     */
    public requestNotificationsAfter$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(NotificationActionEnum.RequestAllAfter),
            withLatestFrom(this._store.pipe(
                select(this._queries.getSlice())
            )),
            switchMap(([action, slice]) => {
                const firstStoredNotificationDate = (action as NotificationActions.Request.AllAfter).payload;
                const limit = 50;

                return this._notificationService.findAll(null, firstStoredNotificationDate, limit)
                    .pipe(
                        mergeMap((notificationList: NotificationListResource) => {
                            const hasMoreNotificationsToFetch = notificationList._links.hasOwnProperty('prev');
                            const newNotificationsLength = notificationList.items.length;
                            const firstNewNotificationDate = newNotificationsLength ? notificationList.items[newNotificationsLength - 1].date : null;
                            let actions: Action[] = [new NotificationActions.Request.AllAfterFulfilled(notificationList)];

                            if (hasMoreNotificationsToFetch) {
                                actions = [...actions, new NotificationActions.Request.AllAfter(firstNewNotificationDate)];
                            } else {
                                // if there are no recent notifications, use the the most recent stored notification date
                                const lastAdded = firstNewNotificationDate || firstStoredNotificationDate;

                                // if the newest notification is not seen yet, then we should mark the list as seen
                                const shouldSetAsSeen = this._queries.isDateNotSeen(lastAdded, slice.list.lastSeen);

                                actions = shouldSetAsSeen ? [...actions, new NotificationActions.Set.AsSeen(lastAdded)] : actions;
                            }

                            return actions;
                        }),
                        catchError(() => of(new NotificationActions.Request.AllAfterRejected()))
                    );
            })));

    /**
     * @description Request notifications interceptor to request previous list of notifications
     * @type {Observable<Action>}
     */
    public requestNotificationsBefore$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(NotificationActionEnum.RequestAllBefore),
            switchMap((action: NotificationActions.Request.AllBefore) => {
                const lastNotificationDate = action.payload;

                return this._notificationService.findAll(lastNotificationDate)
                    .pipe(
                        map((notificationList: NotificationListResource) => new NotificationActions.Request.AllBeforeFulfilled(notificationList)),
                        catchError(() => of(new NotificationActions.Request.AllBeforeRejected()))
                    );
            })));

    /**
     * @description Set notification as read interceptor to mark notification as read in the backend
     * @type {Observable<Action>}
     */
    public markNotificationAsRead$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(NotificationActionEnum.SetAsRead),
            switchMap((action: NotificationActions.Set.AsRead) => {
                const notificationId = action.payload;

                return this._notificationService.markAsRead(notificationId)
                    .pipe(
                        map(() => new NotificationActions.Set.AsReadFulfilled(notificationId)),
                        catchError(() => of(new NotificationActions.Set.AsReadRejected(notificationId)))
                    );
            })));

    /**
     * @description Set notification as read interceptor to mark notification as read in the backend
     * @type {Observable<Action>}
     */
    public markNotificationsAsSeen$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(NotificationActionEnum.SetAsSeen),
            switchMap((action: NotificationActions.Set.AsSeen) => {
                const lastSeen = action.payload;

                return this._notificationService.markAsSeen(lastSeen)
                    .pipe(
                        map(() => new NotificationActions.Set.AsSeenFulfilled(lastSeen)),
                        catchError(() => of(new NotificationActions.Set.AsSeenRejected(lastSeen)))
                    );
            })));

}
