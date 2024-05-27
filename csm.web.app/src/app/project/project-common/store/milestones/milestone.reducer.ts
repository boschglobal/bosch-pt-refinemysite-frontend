/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ActionReducer} from '@ngrx/store';
import {
    orderBy,
    union,
    unionBy
} from 'lodash';

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {MilestoneResource} from '../../api/milestones/resources/milestone.resource';
import {MilestoneListLinks} from '../../api/milestones/resources/milestone-list.resource';
import {
    MilestoneActionEnum,
    MilestoneActions
} from './milestone.actions';
import {MILESTONE_SLICE_INITIAL_STATE} from './milestone.initial-state';
import {MilestoneSlice} from './milestone.slice';

const getItemsWithUpdatedPositions = (storedMilestones: MilestoneResource[], milestone: MilestoneResource) => {
    const itemList = storedMilestones.filter(({id, date, header, workArea}) => date === milestone.date
        && header === milestone.header
        && workArea?.id === milestone.workArea?.id
        && id !== milestone.id
    );
    const orderedItemList = orderBy(itemList, 'position', 'asc');

    return [...orderedItemList.slice(0, milestone.position), milestone, ...orderedItemList.slice(milestone.position)]
        .map((item, index) => ({...item, position: index}));
};

export function milestoneReducer(state: MilestoneSlice = MILESTONE_SLICE_INITIAL_STATE, action: MilestoneActions): MilestoneSlice {
    switch (action.type) {

        case MilestoneActionEnum.InitializeAll:
            return MILESTONE_SLICE_INITIAL_STATE;

        case MilestoneActionEnum.InitializeList: {
            const {ids, requestStatus} = MILESTONE_SLICE_INITIAL_STATE.list;

            return Object.assign<{}, MilestoneSlice, Partial<MilestoneSlice>>({}, state, {
                list: Object.assign<AbstractList, AbstractList<MilestoneListLinks>, Partial<AbstractList>>(
                    new AbstractList(), state.list, {
                        ids,
                        requestStatus,
                    }),
            });
        }

        case MilestoneActionEnum.RequestAll:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractList(), state.list, {
                    requestStatus: RequestStatusEnum.progress,
                }),
            });

        case MilestoneActionEnum.RequestAllFulfilled: {
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

        case MilestoneActionEnum.RequestAllByMilestoneListIdsFulfilled:
        case MilestoneActionEnum.RequestAllByIdsFulfilled: {
            const ids = action.payload.map(({id}) => id);

            return Object.assign({}, state, {
                items: unionBy(action.payload, state.items, 'id'),
                list: Object.assign(new AbstractList(), state.list, {
                    ids: union(ids, state.list.ids),
                }),
            });
        }

        case MilestoneActionEnum.RequestAllRejected:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractList(), state.list, {
                    requestStatus: RequestStatusEnum.error,
                }),
            });

        case MilestoneActionEnum.CreateOne:
        case MilestoneActionEnum.DeleteOne:
        case MilestoneActionEnum.RequestOne:
        case MilestoneActionEnum.UpdateOne:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.progress,
                }),
            });

        case MilestoneActionEnum.RequestOneFulfilled:
        case MilestoneActionEnum.CreateOneFulfilled:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success,
                }),
                items: unionBy(getItemsWithUpdatedPositions(state.items, action.item), state.items, 'id'),
                list: Object.assign(new AbstractList(), state.list, {
                    ids: union(state.list.ids, [action.item.id]),
                }),
            });

        case MilestoneActionEnum.DeleteOneFulfilled:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success,
                }),
                items: state.items.filter(item => item.id !== action.itemId),
                list: Object.assign(new AbstractList(), state.list, {
                    ids: state.list.ids.filter(id => id !== action.itemId),
                }),
            });

        case MilestoneActionEnum.UpdateOneFulfilled:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success,
                }),
                items: unionBy(getItemsWithUpdatedPositions(state.items, action.item), state.items, 'id'),
            });

        case MilestoneActionEnum.CreateOneRejected:
        case MilestoneActionEnum.DeleteOneRejected:
        case MilestoneActionEnum.RequestOneRejected:
        case MilestoneActionEnum.UpdateOneRejected:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.error,
                }),
            });

        case MilestoneActionEnum.CreateOneReset:
        case MilestoneActionEnum.DeleteOneReset:
        case MilestoneActionEnum.UpdateOneReset:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.empty,
                }),
            });

        case MilestoneActionEnum.SetFilters:
            return Object.assign<{}, MilestoneSlice, Partial<MilestoneSlice>>({}, state, {
                filters: action.payload,
            });

        default:
            return state;
    }
}

export const MILESTONE_REDUCER: ActionReducer<MilestoneSlice> = milestoneReducer;
