/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {unionBy} from 'lodash';

import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {AbstractItemWithPicture} from '../../../shared/misc/store/datatypes/abstract-item-with-picture.datatype';
import {UserPrivacySettings} from '../../../shared/privacy/api/resources/user-privacy-settings.resource';
import {
    UserActionEnum,
    UserActions,
    UserPictureActions
} from './user.actions';
import {USER_SLICE_INITIAL_STATE} from './user.initial-state';
import {UserSlice} from './user.slice';

export function userReducer(state: UserSlice = USER_SLICE_INITIAL_STATE, action: UserActions | UserPictureActions): UserSlice {
    switch (action.type) {

        case UserActionEnum.RequestCurrent:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItemWithPicture(), state.currentItem, {
                    requestStatus: RequestStatusEnum.progress,
                }),
            });

        case UserActionEnum.CreateOne:
        case UserActionEnum.UpdateOne:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItemWithPicture(), state.currentItem, {
                    requestStatus: RequestStatusEnum.progress,
                    dataRequestStatus: RequestStatusEnum.progress,
                }),
            });

        case UserActionEnum.CreateUserPicture:
        case UserActionEnum.DeleteUserPicture:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItemWithPicture(), state.currentItem, {
                    requestStatus: RequestStatusEnum.progress,
                    pictureRequestStatus: RequestStatusEnum.progress,
                }),
            });

        case UserActionEnum.RequestCurrentFulfilled:
            return Object.assign({}, state, {
                items: unionBy([action.payload], state.items, 'id'),
                currentItem: Object.assign(new AbstractItemWithPicture(), state.currentItem, {
                    id: action.payload.id,
                    requestStatus: RequestStatusEnum.success,
                }),
            });

        case UserActionEnum.CreateOneFulfilled:
        case UserActionEnum.UpdateOneFulfilled:
            return Object.assign({}, state, {
                items: unionBy([action.payload], state.items, 'id'),
                currentItem: Object.assign(new AbstractItemWithPicture(), state.currentItem, {
                    id: action.payload.id,
                    requestStatus: state.currentItem.pictureRequestStatus ===
                    RequestStatusEnum.progress ? state.currentItem.pictureRequestStatus : RequestStatusEnum.success,
                    dataRequestStatus: RequestStatusEnum.success,
                }),
            });

        case UserActionEnum.RequestCurrentRejected:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItemWithPicture(), USER_SLICE_INITIAL_STATE.currentItem),
            });

        case UserActionEnum.CreateOneRejected:
        case UserActionEnum.UpdateOneRejected:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItemWithPicture(), state.currentItem, {
                    requestStatus: RequestStatusEnum.error,
                    dataRequestStatus: RequestStatusEnum.error,
                }),
            });

        case UserActionEnum.DeleteUserPictureRejected:
        case UserActionEnum.CreateUserPictureRejected:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItemWithPicture(), state.currentItem, {
                    requestStatus: RequestStatusEnum.error,
                    pictureRequestStatus: RequestStatusEnum.error,
                }),
            });

        case UserActionEnum.CreateUserPictureFulfilled:
        case UserActionEnum.DeleteUserPictureFulfilled:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItemWithPicture(), state.currentItem, {
                    requestStatus: state.currentItem.dataRequestStatus ===
                    RequestStatusEnum.progress ? state.currentItem.pictureRequestStatus : RequestStatusEnum.success,
                    pictureRequestStatus: RequestStatusEnum.success,
                }),
            });

        case UserActionEnum.SetPrivacySettingsFulfilled:
            return Object.assign({}, state, {
                privacySettings: Object.assign(new UserPrivacySettings(), action.payload),
            });

        case UserActionEnum.SetPrivacySettingsRejected:
            return Object.assign({}, state, {
                privacySettings: null,
            });

        default:
            return state;
    }
}

export const USER_REDUCER = userReducer;
