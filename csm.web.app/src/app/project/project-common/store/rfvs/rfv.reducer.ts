/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {ActionReducer} from '@ngrx/store';
import {unionBy} from 'lodash';

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {
    RfvActions,
    RfvActionsEnum
} from './rfv.actions';
import {RFV_SLICE_INITIAL_STATE} from './rfv.initial-state';
import {RfvSlice} from './rfv.slice';

export function rfvReducer(state: RfvSlice = RFV_SLICE_INITIAL_STATE, action: RfvActions): RfvSlice {
    switch (action.type) {
        case RfvActionsEnum.InitializeAll: {
            return RFV_SLICE_INITIAL_STATE;
        }

        case RfvActionsEnum.RequestAll: {
            return Object.assign({}, state, {
                list: Object.assign(new AbstractList(), state.list, {
                    requestStatus: RequestStatusEnum.progress,
                }),
            });
        }

        case RfvActionsEnum.RequestAllFulfilled: {
            return Object.assign({}, state, {
                items: unionBy(action.items, state.items, 'id'),
                list: Object.assign(new AbstractList(), state.list, {
                    ids: action.items.map(item => item.id),
                    requestStatus: RequestStatusEnum.success,
                }),
            });
        }

        case RfvActionsEnum.RequestAllRejected: {
            return Object.assign({}, state, {
                list: Object.assign(new AbstractList(), state.list, {
                    requestStatus: RequestStatusEnum.error,
                }),
            });
        }

        case RfvActionsEnum.UpdateOne:
        case RfvActionsEnum.ActivateOne:
        case RfvActionsEnum.DeactivateOne: {
            const rfv = state.items.find(item => item.id === action.item.key);
            const updatedRfv = Object.assign({}, rfv, {
                requestStatus: RequestStatusEnum.progress,
            });

            return Object.assign({}, state, {
                items: unionBy([updatedRfv], state.items, 'id'),
            });
        }

        case RfvActionsEnum.UpdateOneFulfilled:
        case RfvActionsEnum.ActivateOneFulfilled:
        case RfvActionsEnum.DeactivateOneFulfilled: {
            const rfv = Object.assign({}, action.item, {requestStatus: RequestStatusEnum.success});

            return Object.assign({}, state, {
                items: unionBy([rfv], state.items, 'id'),
            });
        }

        case RfvActionsEnum.UpdateOneRejected:
        case RfvActionsEnum.ActivateOneRejected:
        case RfvActionsEnum.DeactivateOneRejected: {
            const rfv = state.items.find(item => item.id === action.itemId);
            const updatedRfv = Object.assign({}, rfv, {
                requestStatus: RequestStatusEnum.error,
            });

            return Object.assign({}, state, {
                items: unionBy([updatedRfv], state.items, 'id'),
            });
        }

        case RfvActionsEnum.UpdateOneReset:
        case RfvActionsEnum.ActivateOneReset:
        case RfvActionsEnum.DeactivateOneReset: {
            const rfv = state.items.find(item => item.id === action.itemId);
            const updatedRfv = Object.assign({}, rfv, {
                requestStatus: RequestStatusEnum.empty,
            });

            return Object.assign({}, state, {
                items: unionBy([updatedRfv], state.items, 'id'),
            });
        }
        default:
            return state;
    }
}

export const RFV_REDUCER: ActionReducer<RfvSlice> = rfvReducer;
