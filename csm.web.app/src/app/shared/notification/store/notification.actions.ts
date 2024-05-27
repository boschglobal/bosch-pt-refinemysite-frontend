/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {NotificationListResource} from '../api/resources/notification-list.resource';

export enum NotificationActionEnum {
    RequestAll = '[Notification] Request all',
    RequestAllFulfilled = '[Notification] Request all fulfilled',
    RequestAllRejected = '[Notification] Request all rejected',
    RequestAllAfter = '[Notification] Request all after',
    RequestAllAfterFulfilled = '[Notification] Request all after fulfilled',
    RequestAllAfterRejected = '[Notification] Request all after rejected',
    RequestAllBefore = '[Notification] Request all before',
    RequestAllBeforeFulfilled = '[Notification] Request all before fulfilled',
    RequestAllBeforeRejected = '[Notification] Request all before rejected',
    SetAsSeen = '[Notification] Set as seen',
    SetAsSeenFulfilled = '[Notification] Set as seen fulfilled',
    SetAsSeenRejected = '[Notification] Set as seen rejected',
    SetAsRead = '[Notification] Set as read',
    SetAsReadFulfilled = '[Notification] Set as read fulfilled',
    SetAsReadRejected = '[Notification] Set as read rejected',
    SetLastAdded = '[Notification] Set as added',
}

export namespace NotificationActions {
    export namespace Request {
        export class All implements Action {
            readonly type = NotificationActionEnum.RequestAll;

            constructor() {
            }
        }

        export class AllFulfilled implements Action {
            readonly type = NotificationActionEnum.RequestAllFulfilled;

            constructor(public payload: NotificationListResource) {
            }
        }

        export class AllRejected implements Action {
            readonly type = NotificationActionEnum.RequestAllRejected;

            constructor() {
            }
        }

        export class AllAfter implements Action {
            readonly type = NotificationActionEnum.RequestAllAfter;

            constructor(public payload: string) {
            }
        }

        export class AllAfterFulfilled implements Action {
            readonly type = NotificationActionEnum.RequestAllAfterFulfilled;

            constructor(public payload: NotificationListResource) {
            }
        }

        export class AllAfterRejected implements Action {
            readonly type = NotificationActionEnum.RequestAllAfterRejected;

            constructor() {
            }
        }

        export class AllBefore implements Action {
            readonly type = NotificationActionEnum.RequestAllBefore;

            constructor(public payload: string) {
            }
        }

        export class AllBeforeFulfilled implements Action {
            readonly type = NotificationActionEnum.RequestAllBeforeFulfilled;

            constructor(public payload: NotificationListResource) {
            }
        }

        export class AllBeforeRejected implements Action {
            readonly type = NotificationActionEnum.RequestAllBeforeRejected;

            constructor() {
            }
        }
    }

    export namespace Set {
        export class AsSeen implements Action {
            readonly type = NotificationActionEnum.SetAsSeen;

            constructor(public payload: string) {
            }
        }

        export class AsSeenFulfilled implements Action {
            readonly type = NotificationActionEnum.SetAsSeenFulfilled;

            constructor(public payload: string) {
            }
        }

        export class AsSeenRejected implements Action {
            readonly type = NotificationActionEnum.SetAsSeenRejected;

            constructor(public payload: string) {
            }
        }

        export class AsRead implements Action {
            readonly type = NotificationActionEnum.SetAsRead;

            constructor(public payload: string) {
            }
        }

        export class AsReadFulfilled implements Action {
            readonly type = NotificationActionEnum.SetAsReadFulfilled;

            constructor(public payload: string) {
            }
        }

        export class AsReadRejected implements Action {
            readonly type = NotificationActionEnum.SetAsReadRejected;

            constructor(public payload: string) {
            }
        }

        export class LastAdded implements Action {
            readonly type = NotificationActionEnum.SetLastAdded;

            constructor(public payload: string) {
            }
        }
    }
}

export type NotificationActions =
    NotificationActions.Request.All |
    NotificationActions.Request.AllFulfilled |
    NotificationActions.Request.AllRejected |
    NotificationActions.Request.AllAfter |
    NotificationActions.Request.AllAfterFulfilled |
    NotificationActions.Request.AllAfterRejected |
    NotificationActions.Request.AllBefore |
    NotificationActions.Request.AllBeforeFulfilled |
    NotificationActions.Request.AllBeforeRejected |
    NotificationActions.Set.AsRead |
    NotificationActions.Set.AsReadFulfilled |
    NotificationActions.Set.AsReadRejected |
    NotificationActions.Set.AsSeen |
    NotificationActions.Set.AsSeenFulfilled |
    NotificationActions.Set.AsSeenRejected |
    NotificationActions.Set.LastAdded;
