/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {ActionReducer} from '@ngrx/store';
import {
    union,
    unionBy
} from 'lodash';

import {PATResource} from '../../../project/project-common/api/pats/resources/pat.resource';
import {AbstractList} from '../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../shared/misc/store/datatypes/abstract-item.datatype';
import {
    PATActionEnum,
    PATActions
} from './pat.actions';
import {PAT_SLICE_INITIAL_STATE} from './pat.initial-state';
import {PATSlice} from './pat.slice';

export function patReducer(state: PATSlice = PAT_SLICE_INITIAL_STATE, action: PATActions): PATSlice {

    switch (action.type) {
        case PATActionEnum.InitializeAll:
            return PAT_SLICE_INITIAL_STATE;

        case PATActionEnum.InitializeCurrent:
            return Object.assign({}, state, {
                currentItem: PAT_SLICE_INITIAL_STATE.currentItem,
            });

        case PATActionEnum.InitializeList:
            return Object.assign({}, state, {
                list: PAT_SLICE_INITIAL_STATE.list,
            });

        case PATActionEnum.RequestAll:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractList(), state.list, {
                    requestStatus: RequestStatusEnum.progress,
                }),
            });

        case PATActionEnum.RequestAllRejected:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractList(), state.list, {
                    requestStatus: RequestStatusEnum.error,
                }),
            });

        case PATActionEnum.RequestAllFulfilled:
            return Object.assign({}, state, {
                items: action.payload.items,
                list: Object.assign(new AbstractList(), state.list, {
                    ids: action.payload.items.map((item: PATResource) => item.id),
                    requestStatus: RequestStatusEnum.success,
                }),
            });

        case PATActionEnum.DeleteOneFulfilled:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success,
                }),
                items: state.items.filter(item => item.id !== action.payload),
            });

        case PATActionEnum.CreateOne:
        case PATActionEnum.DeleteOne:
        case PATActionEnum.UpdateOne:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.progress,
                }),
            });

        case PATActionEnum.CreateOneRejected:
        case PATActionEnum.DeleteOneRejected:
        case PATActionEnum.UpdateOneRejected:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.error,
                }),
            });

        case PATActionEnum.CreateOneFulfilled: {
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    id: action.payload.id,
                    requestStatus: RequestStatusEnum.success,
                }),
                items: unionBy([action.payload], state.items, 'id'),
                list: Object.assign(new AbstractList(), state.list, {
                    ids: union(state.list.ids, [action.payload.id]),
                    requestStatus: RequestStatusEnum.success,
                }),
            });
        }

        case PATActionEnum.UpdateOneFulfilled: {
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success,
                }),
                items: unionBy([action.payload], state.items, 'id'),
            });
        }

        default:
            return state;
    }
}

export const PAT_REDUCER: ActionReducer<PATSlice> = patReducer;
