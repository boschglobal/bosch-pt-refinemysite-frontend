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
    unionBy,
} from 'lodash';

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {
    QuickFilterActionEnum,
    QuickFilterActions,
} from './quick-filter.actions';
import {QUICK_FILTER_SLICE_INITIAL_STATE} from './quick-filter.initial-state';
import {QuickFilterSlice} from './quick-filter.slice';

export function quickFilterReducer(
    state: QuickFilterSlice = QUICK_FILTER_SLICE_INITIAL_STATE,
    action: QuickFilterActions,
): QuickFilterSlice {
    switch (action.type) {

        case QuickFilterActionEnum.InitializeAll:
            return QUICK_FILTER_SLICE_INITIAL_STATE;

        case QuickFilterActionEnum.RequestAll:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractList(), state.list, {
                    requestStatus: RequestStatusEnum.progress,
                }),
            });

        case QuickFilterActionEnum.RequestAllFulfilled: {
            const items = action.list.items;
            const itemIds: string[] = items.map(item => item.id);

            return Object.assign({}, state, {
                items: unionBy(items, state.items, 'id'),
                list: Object.assign(new AbstractList(), state.list, {
                    ids: itemIds,
                    requestStatus: RequestStatusEnum.success,
                    _links: action.list._links,
                }),
            });
        }

        case QuickFilterActionEnum.RequestAllRejected:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractList(), state.list, {
                    requestStatus: RequestStatusEnum.error,
                }),
            });

        case QuickFilterActionEnum.CreateOne:
        case QuickFilterActionEnum.DeleteOne:
        case QuickFilterActionEnum.UpdateOne:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.progress,
                }),
            });

        case QuickFilterActionEnum.CreateOneFulfilled:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success,
                }),
                items: unionBy([action.item], state.items, 'id'),
                list: Object.assign(new AbstractList(), state.list, {
                    ids: union([action.item.id], state.list.ids),
                }),
            });

        case QuickFilterActionEnum.DeleteOneFulfilled:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success,
                }),
                items: state.items.filter(item => item.id !== action.itemId),
                list: Object.assign(new AbstractList(), state.list, {
                    ids: state.list.ids.filter(id => id !== action.itemId),
                }),
            });

        case QuickFilterActionEnum.SetAppliedFilter: {
            return Object.assign({}, state, {
                appliedFilterId: Object.assign({}, state.appliedFilterId, {
                    [action.context]: action.filterId,
                }),
            });
        }

        case QuickFilterActionEnum.UpdateOneFulfilled:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success,
                }),
                items: unionBy([action.item], state.items, 'id'),
            });

        case QuickFilterActionEnum.CreateOneRejected:
        case QuickFilterActionEnum.DeleteOneRejected:
        case QuickFilterActionEnum.UpdateOneRejected:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.error,
                }),
            });

        case QuickFilterActionEnum.CreateOneReset:
        case QuickFilterActionEnum.DeleteOneReset:
        case QuickFilterActionEnum.UpdateOneReset:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.empty,
                }),
            });
        default:
            return state;
    }
}

export const QUICK_FILTER_REDUCER: ActionReducer<QuickFilterSlice> = quickFilterReducer;
