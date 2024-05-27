/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {ActionReducer} from '@ngrx/store';
import {
    flatten,
    unionBy,
} from 'lodash';

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {DayCardResource} from '../../api/day-cards/resources/day-card.resource';
import {TaskScheduleResource} from '../../api/tasks/resources/task-schedule.resource';
import {
    DayCardActionEnum,
    DayCardActions
} from './day-card.actions';
import {DAY_CARD_SLICE_INITIAL_STATE} from './day-card.initial-state';
import {DayCardSlice} from './day-card.slice';

const extractDayCardsFromSchedules = (taskSchedules: TaskScheduleResource[]): DayCardResource[] => {

    const dayCardsBySchedule = taskSchedules.map(schedule => {
        const dayCards = schedule._embedded ? schedule._embedded.dayCards.items : [];

        return dayCards.map(dayCard => Object.assign(new DayCardResource(), dayCard));
    });

    return flatten(dayCardsBySchedule);
};

const extractDayCardFromSchedule = (schedule: TaskScheduleResource): DayCardResource[] => extractDayCardsFromSchedules([schedule]);

export function dayCardReducer(state: DayCardSlice = DAY_CARD_SLICE_INITIAL_STATE, action: DayCardActions): DayCardSlice {
    switch (action.type) {

        case DayCardActionEnum.InitializeAllDayCards:
            return DAY_CARD_SLICE_INITIAL_STATE;

        case DayCardActionEnum.CreateOneDayCard:
        case DayCardActionEnum.DeleteOneDayCard:
        case DayCardActionEnum.UpdateOneDayCard:
        case DayCardActionEnum.RequestOneDayCard:
        case DayCardActionEnum.ApproveOneDayCard:
        case DayCardActionEnum.CancelOneDayCard:
        case DayCardActionEnum.CompleteOneDayCard:
        case DayCardActionEnum.ResetOneDayCard:
        case DayCardActionEnum.CompleteAllDayCard:
        case DayCardActionEnum.CancelAllDayCard:
        case DayCardActionEnum.ApproveAllDayCard:
        case DayCardActionEnum.DeleteAllDayCard:
        case DayCardActionEnum.RequestAllDayCard:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.progress,
                }),
            });

        case DayCardActionEnum.CreateOneDayCardReset:
        case DayCardActionEnum.DeleteOneDayCardReset:
        case DayCardActionEnum.UpdateOneDayCardReset:
        case DayCardActionEnum.ApproveOneDayCardReset:
        case DayCardActionEnum.CancelOneDayCardReset:
        case DayCardActionEnum.CompleteOneDayCardReset:
        case DayCardActionEnum.ResetOneDayCardReset:
        case DayCardActionEnum.DeleteAllDayCardReset:
        case DayCardActionEnum.ApproveAllDayCardReset:
        case DayCardActionEnum.CancelAllDayCardReset:
        case DayCardActionEnum.CompleteAllDayCardReset:
        case DayCardActionEnum.RequestAllDayCardReset:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.empty,
                }),
            });

        case DayCardActionEnum.RequestOneDayCardFulfilled:
        case DayCardActionEnum.UpdateOneDayCardPartiallyFulfilled:
        case DayCardActionEnum.UpdateOneDayCardFulfilled:
        case DayCardActionEnum.ApproveOneDayCardFulfilled:
        case DayCardActionEnum.CancelOneDayCardFulfilled:
        case DayCardActionEnum.CompleteOneDayCardFulfilled:
        case DayCardActionEnum.ResetOneDayCardFulfilled: {
            const newItem = action.payload;
            const updatedItem = Object.assign(new DayCardResource(), newItem);

            return Object.assign({}, state, {
                items: unionBy([updatedItem], state.items, 'id'),
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success,
                }),
            });
        }
        case DayCardActionEnum.CompleteAllDayCardFulfilled:
        case DayCardActionEnum.CancelAllDayCardFulfilled:
        case DayCardActionEnum.ApproveAllDayCardFulfilled:
        case DayCardActionEnum.RequestAllDayCardFulfilled: {
            const updatedItems = action.payload.map(item => Object.assign(new DayCardResource(), item));
            return Object.assign({}, state, {
                items: unionBy(updatedItems, state.items, 'id'),
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success,
                }),
            });
        }
        case DayCardActionEnum.CreateOneDayCardFulfilled:
        case DayCardActionEnum.UpdateOneDayCardWithScheduleFulfilled:
            return Object.assign({}, state, {
                items: unionBy(extractDayCardFromSchedule(action.payload), state.items, 'id'),
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success,
                }),
            });

        case DayCardActionEnum.DeleteOneDayCardFulfilled: {
            const taskId = action.payload.task.id;
            const updatedDayCards = extractDayCardFromSchedule(action.payload);
            const filteredStoreItems = state.items.filter(item => item.task.id !== taskId);

            return Object.assign({}, state, {
                items: [...filteredStoreItems, ...updatedDayCards],
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success,
                }),
            });
        }

        case DayCardActionEnum.DeleteAllDayCardFulfilled: {
            const taskIds = action.payload.map(schedule => schedule.task.id);
            const updatedDayCards = extractDayCardsFromSchedules(action.payload);
            const filteredStoreItems = state.items.filter(dayCard => !taskIds.includes(dayCard.task.id));

            return Object.assign({}, state, {
                items: [...filteredStoreItems, ...updatedDayCards],
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success,
                }),
            });
        }

        case DayCardActionEnum.CreateOneDayCardRejected:
        case DayCardActionEnum.DeleteOneDayCardRejected:
        case DayCardActionEnum.UpdateOneDayCardRejected:
        case DayCardActionEnum.RequestOneDayCardRejected:
        case DayCardActionEnum.ApproveOneDayCardRejected:
        case DayCardActionEnum.CancelOneDayCardRejected:
        case DayCardActionEnum.CompleteOneDayCardRejected:
        case DayCardActionEnum.ResetOneDayCardRejected:
        case DayCardActionEnum.CompleteAllDayCardRejected:
        case DayCardActionEnum.CancelAllDayCardRejected:
        case DayCardActionEnum.ApproveAllDayCardRejected:
        case DayCardActionEnum.DeleteAllDayCardRejected:
        case DayCardActionEnum.RequestAllDayCardRejected:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.error,
                }),
            });

        case DayCardActionEnum.RequestAllDayCardsByTaskFulfilled:
        case DayCardActionEnum.UpdateSlotsFulfilled:
            return Object.assign({}, state, {
                items: unionBy(extractDayCardFromSchedule(action.payload), state.items, 'id'),
            });

        case DayCardActionEnum.RequestAllDayCardsFromTasksFulfilled:
            return Object.assign({}, state, {
                items: unionBy(extractDayCardsFromSchedules(action.payload), state.items, 'id'),
            });

        default:
            return state;
    }
}

export const DAY_CARD_REDUCER: ActionReducer<DayCardSlice> = dayCardReducer;
