/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {unionBy} from 'lodash';

import {AbstractItem} from 'src/app/shared/misc/store/datatypes/abstract-item.datatype';
import {UserSlice} from './user.slice';
import {USER_SLICE_INITIAL_STATE} from './user.initial-state';
import {
    UserActionEnum,
    UserActions
} from './user.actions';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';

export function userReducer(state: UserSlice = USER_SLICE_INITIAL_STATE, action: UserActions): UserSlice {
    switch (action.type) {

        case UserActionEnum.DeleteOne:
        case UserActionEnum.SetAdmin:
        case UserActionEnum.SetLock:
        case UserActionEnum.RequestOne:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Progress,
                })
            });

        case UserActionEnum.RequestAuthenticatedUserFulfilled:
            return Object.assign({}, state, {
                items: unionBy([action.payload], state.items, 'id'),
                authenticatedUser: Object.assign(new AbstractItem(), state.authenticatedUser, {
                    id: action.payload.id,
                    requestStatus: RequestStatusEnum.Success,
                })
            });

        case UserActionEnum.DeleteOneFulfilled:
            return Object.assign({}, state, {
                items: state.items.filter(item => item.id !== action.userId),
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Success,
                })
            });

        case UserActionEnum.SetAdminFulfilled:
        case UserActionEnum.SetLockFulfilled:
            return Object.assign({}, state, {
                items: unionBy([action.payload], state.items, 'id'),
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Success,
                })
            });

        case UserActionEnum.DeleteOneRejected:
        case UserActionEnum.SetAdminRejected:
        case UserActionEnum.SetLockRejected:
        case UserActionEnum.RequestOneRejected:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Error,
                })
            });

        case UserActionEnum.DeleteOneReset:
        case UserActionEnum.SetAdminReset:
        case UserActionEnum.RequestOneReset:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Empty,
                })
            });

        case UserActionEnum.RequestAuthenticatedUser:
            return Object.assign({}, state, {
                authenticatedUser: Object.assign(new AbstractItem(), state.authenticatedUser, {
                    requestStatus: RequestStatusEnum.Progress,
                })
            });

        case UserActionEnum.RequestOneFulfilled:
            return Object.assign({}, state, {
                items: unionBy([action.payload], state.items, 'id'),
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    id: action.payload.id,
                    requestStatus: RequestStatusEnum.Success,
                })
            });

        case UserActionEnum.RequestSuggestionsFulfilled:
            const requestSuggestionsFulfilledAction = action;
            return Object.assign({}, state, {
                suggestions: Object.assign([], requestSuggestionsFulfilledAction.payload.items)
            });

        case UserActionEnum.RequestAuthenticatedUserRejected:
            return Object.assign({}, state, {
                authenticatedUser: Object.assign(new AbstractItem(), USER_SLICE_INITIAL_STATE.authenticatedUser)
            });

        default:
            return state;
    }
}

export const USER_REDUCER = userReducer;
