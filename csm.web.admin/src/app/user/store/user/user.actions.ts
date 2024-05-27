/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {UserResource} from '../../api/resources/user.resource';
import {UserSuggestionsResource} from '../../api/resources/user-suggestions.resource';

export enum UserActionEnum {
    RequestAuthenticatedUser = '[User] Request authenticated user',
    RequestAuthenticatedUserFulfilled = '[User] Request authenticated user fulfilled',
    RequestAuthenticatedUserRejected = '[User] Request authenticated user rejected',
    RequestSuggestions = '[User] Request user suggestions',
    RequestSuggestionsFulfilled = '[User] Request users suggestions fulfilled',
    RequestOne = '[User] Request a user',
    RequestOneFulfilled = '[User] Request a user fulfilled',
    RequestOneRejected = '[User] Request a user rejected',
    RequestOneReset = '[User] Request a user reset',
    SetCurrent = '[User] Set the current user',
    SetAdmin = '[User] Set user admin permission',
    SetAdminFulfilled = '[User] Set user admin permission fulfilled',
    SetAdminRejected = '[User] Set user admin permission rejected',
    SetAdminReset = '[User] Set user admin permission reset',
    SetLock = '[User] Set user lock',
    SetLockFulfilled = '[User] Set user lock fulfilled',
    SetLockRejected = '[User] Set user lock rejected',
    DeleteOne = '[User] Delete a user',
    DeleteOneFulfilled = '[User] Delete a user fulfilled',
    DeleteOneRejected = '[User] Delete a user rejected',
    DeleteOneReset = '[User] Delete a user reset',
}

export namespace UserActions {

    export namespace Request {

        export class AuthenticatedUser implements Action {
            readonly type = UserActionEnum.RequestAuthenticatedUser;

            constructor() {
            }
        }

        export class AuthenticatedUserFulfilled implements Action {
            readonly type = UserActionEnum.RequestAuthenticatedUserFulfilled;

            constructor(public payload: UserResource) {
            }
        }

        export class AuthenticatedUserRejected implements Action {
            readonly type = UserActionEnum.RequestAuthenticatedUserRejected;

            constructor() {
            }
        }

        export class One implements Action {
            readonly type = UserActionEnum.RequestOne;

            constructor(public userId: string) {
            }
        }

        export class OneReset implements Action {
            readonly type = UserActionEnum.RequestOneReset;

            constructor() {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = UserActionEnum.RequestOneFulfilled;

            constructor(public payload: UserResource) {
            }
        }

        export class OneRejected implements Action {
            readonly type = UserActionEnum.RequestOneRejected;

            constructor() {
            }
        }

        export class RequestSuggestions implements Action {
            readonly type = UserActionEnum.RequestSuggestions;

            constructor(public payload: string) {
            }
        }

        export class RequestSuggestionsFulfilled implements Action {
            readonly type = UserActionEnum.RequestSuggestionsFulfilled;

            constructor(public payload: UserSuggestionsResource) {
            }
        }

    }

    export namespace Set {

        export class Admin implements Action {
            readonly type = UserActionEnum.SetAdmin;

            constructor(public userId: string, public payload: boolean, public version: number) {
            }
        }

        export class AdminReset implements Action {
            readonly type = UserActionEnum.SetAdminReset;

            constructor() {
            }
        }

        export class Current implements Action {
            readonly type = UserActionEnum.SetCurrent;

            constructor(public id: string) {
            }
        }

        export class AdminFulfilled implements Action {
            readonly type = UserActionEnum.SetAdminFulfilled;

            constructor(public payload: UserResource) {
            }
        }

        export class AdminRejected implements Action {
            readonly type = UserActionEnum.SetAdminRejected;

            constructor() {
            }
        }

        export class Lock implements Action {
            readonly type = UserActionEnum.SetLock;

            constructor(public userId: string, public payload: boolean, public version: number) {
            }
        }

        export class LockFulfilled implements Action {
            readonly type = UserActionEnum.SetLockFulfilled;

            constructor(public payload: UserResource) {
            }
        }

        export class LockRejected implements Action {
            readonly type = UserActionEnum.SetLockRejected;

            constructor() {
            }
        }
    }

    export namespace Delete {

        export class One implements Action {
            readonly type = UserActionEnum.DeleteOne;

            constructor(public userId: string,
                        public version: number) {
            }
        }

        export class OneReset implements Action {
            readonly type = UserActionEnum.DeleteOneReset;

            constructor() {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = UserActionEnum.DeleteOneFulfilled;

            constructor(public userId: string) {
            }
        }

        export class OneRejected implements Action {
            readonly type = UserActionEnum.DeleteOneRejected;

            constructor() {
            }
        }

    }

}

export type UserActions =
    UserActions.Request.AuthenticatedUser |
    UserActions.Request.AuthenticatedUserFulfilled |
    UserActions.Request.AuthenticatedUserRejected |
    UserActions.Request.One |
    UserActions.Request.OneReset |
    UserActions.Request.OneFulfilled |
    UserActions.Request.OneRejected |
    UserActions.Request.RequestSuggestions |
    UserActions.Request.RequestSuggestionsFulfilled |
    UserActions.Delete.One |
    UserActions.Delete.OneReset |
    UserActions.Delete.OneFulfilled |
    UserActions.Delete.OneRejected |
    UserActions.Set.Admin |
    UserActions.Set.AdminReset |
    UserActions.Set.AdminFulfilled |
    UserActions.Set.AdminRejected |
    UserActions.Set.Current |
    UserActions.Set.Lock |
    UserActions.Set.LockFulfilled |
    UserActions.Set.LockRejected;
