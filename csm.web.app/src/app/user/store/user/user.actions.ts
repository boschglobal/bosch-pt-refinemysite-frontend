/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {UserPrivacySettings} from '../../../shared/privacy/api/resources/user-privacy-settings.resource';
import {SaveUserResource} from '../../api/resources/save-user.resource';
import {SaveUserPictureResource} from '../../api/resources/save-user-picture.resource';
import {UserResource} from '../../api/resources/user.resource';
import {UserPictureResource} from '../../api/resources/user-picture.resource';

export enum UserActionEnum {
    RequestCurrent = '[User] Request current',
    RequestCurrentFulfilled = '[User] Request current fulfilled',
    RequestCurrentRejected = '[User] Request current rejected',
    RequestPrivacySettings = '[User] Request privacy settings',
    CreateOne = '[User] Create one',
    CreateOneFulfilled = '[User] Create one fulfilled',
    CreateOneRejected = '[User] Create one rejected',
    UpdateOne = '[User] Update one',
    UpdateOneFulfilled = '[User] Update one fulfilled',
    UpdateOneRejected = '[User] Update one rejected',
    CreateUserPicture = '[User] Create user picture',
    CreateUserPictureFulfilled = '[User] Create user picture fulfilled',
    CreateUserPictureRejected = '[User] Create user picture rejected',
    DeleteUserPicture = '[User] Delete user picture',
    DeleteUserPictureFulfilled = '[User] Delete user picture fulfilled',
    DeleteUserPictureRejected = '[User] Delete user picture rejected',
    SetPrivacySettings = '[Calendar] Set privacy Settings',
    SetPrivacySettingsFulfilled = '[Calendar] Set privacy settings fulfilled',
    SetPrivacySettingsRejected = '[Calendar] Set privacy settings rejected',
}

export namespace UserActions {

    export namespace Request {

        export class Current implements Action {
            readonly type = UserActionEnum.RequestCurrent;

            constructor() {
            }
        }

        export class CurrentFulfilled implements Action {
            readonly type = UserActionEnum.RequestCurrentFulfilled;

            constructor(public payload: UserResource) {
            }
        }

        export class CurrentRejected implements Action {
            readonly type = UserActionEnum.RequestCurrentRejected;

            constructor() {
            }
        }

        export class PrivacySettings implements Action {
            readonly type = UserActionEnum.RequestPrivacySettings;

            constructor() {
            }
        }
    }

    export namespace Create {

        export class One implements Action {
            readonly type = UserActionEnum.CreateOne;

            constructor(public payload: SaveUserResource, public legalDocumentsIds: string[], public profilePicture?: File) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = UserActionEnum.CreateOneFulfilled;

            constructor(public payload: UserResource) {
            }
        }

        export class OneRejected implements Action {
            readonly type = UserActionEnum.CreateOneRejected;

            constructor() {
            }
        }

    }

    export namespace Set {
        export class PrivacySettings implements Action {
            readonly type = UserActionEnum.SetPrivacySettings;

            constructor(public payload: UserPrivacySettings) {
            }
        }

        export class PrivacySettingsFulfilled implements Action {
            readonly type = UserActionEnum.SetPrivacySettingsFulfilled;

            constructor(public payload: UserPrivacySettings) {
            }
        }

        export class PrivacySettingsRejected implements Action {
            readonly type = UserActionEnum.SetPrivacySettingsRejected;
        }
    }

    export namespace Update {

        export class One implements Action {
            readonly type = UserActionEnum.UpdateOne;

            constructor(public payload: SaveUserResource) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = UserActionEnum.UpdateOneFulfilled;

            constructor(public payload: UserResource) {
            }
        }

        export class OneRejected implements Action {
            readonly type = UserActionEnum.UpdateOneRejected;

            constructor() {
            }
        }
    }
}

export namespace UserPictureActions {

    export namespace CreateOrUpdate {

        export class UserPicture implements Action {
            readonly type = UserActionEnum.CreateUserPicture;

            constructor(public payload: SaveUserPictureResource, public isUserEdited = false) {
            }
        }

        export class UserPictureFulfilled implements Action {
            readonly type = UserActionEnum.CreateUserPictureFulfilled;

            constructor(public payload: UserPictureResource, public isUserEdited = false) {
            }
        }

        export class UserPictureRejected implements Action {
            readonly type = UserActionEnum.CreateUserPictureRejected;

            constructor() {
            }
        }
    }

    export namespace Delete {

        export class UserPicture implements Action {
            readonly type = UserActionEnum.DeleteUserPicture;

            constructor(public isUserEdited = false) {
            }
        }

        export class UserPictureFulfilled implements Action {
            readonly type = UserActionEnum.DeleteUserPictureFulfilled;

            constructor(public payload: string, public isUserEdited = false) {
            }
        }

        export class UserPictureRejected implements Action {
            readonly type = UserActionEnum.DeleteUserPictureRejected;

            constructor() {
            }
        }
    }
}

export type UserActions =
    UserActions.Request.Current |
    UserActions.Request.CurrentFulfilled |
    UserActions.Request.CurrentRejected |
    UserActions.Request.PrivacySettings |
    UserActions.Create.One |
    UserActions.Create.OneFulfilled |
    UserActions.Create.OneRejected |
    UserActions.Set.PrivacySettings |
    UserActions.Set.PrivacySettingsFulfilled |
    UserActions.Set.PrivacySettingsRejected |
    UserActions.Update.One |
    UserActions.Update.OneFulfilled |
    UserActions.Update.OneRejected;

export type UserPictureActions =
    UserPictureActions.CreateOrUpdate.UserPicture |
    UserPictureActions.CreateOrUpdate.UserPictureFulfilled |
    UserPictureActions.CreateOrUpdate.UserPictureRejected |
    UserPictureActions.Delete.UserPicture |
    UserPictureActions.Delete.UserPictureFulfilled |
    UserPictureActions.Delete.UserPictureRejected;
