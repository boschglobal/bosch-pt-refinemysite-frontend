/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {ActionReducer} from '@ngrx/store';
import {
    partition,
    unionBy
} from 'lodash';

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {TaskResource} from '../../api/tasks/resources/task.resource';
import {
    TaskScheduleLinks,
    TaskScheduleResource
} from '../../api/tasks/resources/task-schedule.resource';
import {TaskScheduleEntity} from '../../entities/task-schedule/task-schedule.entity';
import {DayCardActionEnum} from '../day-cards/day-card.actions';
import {TaskActionEnum} from '../tasks/task.actions';
import {
    TaskScheduleActionEnum,
    TaskScheduleActions
} from './task-schedule.actions';
import {TASK_SCHEDULE_SLICE_INITIAL_STATE} from './task-schedule.initial-state';
import {TaskScheduleSlice} from './task-schedule.slice';

const updateListRequestStatusForTasks = (state: TaskScheduleSlice,
                                         taskIds: string[],
                                         requestStatus: RequestStatusEnum): Map<string, AbstractList<TaskScheduleLinks>> => {
    const lists = state.lists ? state.lists : new Map<string, AbstractList<TaskScheduleLinks>>();

    const updatedList = taskIds.reduce((list, taskId) => {
        const oldList = lists[taskId] || new AbstractList<TaskScheduleLinks>();
        list[taskId] = Object.assign(new AbstractList(), oldList, {requestStatus});

        return list;
    }, {});

    return Object.assign(new Map(), lists, updatedList);
};

const mapResourcesToEntities = (taskSchedules: TaskScheduleResource[]): TaskScheduleEntity[] =>
    taskSchedules.map(taskSchedule => TaskScheduleEntity.fromResource(taskSchedule));

const mapResourcesToEntitiesAndSortSlots = (taskSchedules: TaskScheduleResource[]): TaskScheduleEntity[] =>
    mapResourcesToEntities(taskSchedules.map(getTaskScheduleWithSortedSlots));

const getTaskScheduleWithSortedSlots = (task: TaskScheduleResource): TaskScheduleResource => {
    const slots = [...task.slots].sort((a, b) => a.date < b.date ? -1 : 1);

    return {...task, slots};
};

const mergeScheduleIfRecent = (state: TaskScheduleSlice, tasks: TaskResource[]): TaskScheduleSlice => {
    const storedSchedules = state.items;
    const [tasksWithSchedule, tasksWithoutSchedule] = partition(tasks, task => task._embedded.schedule != null);

    const recentSchedules = tasksWithSchedule
        .map(task => task._embedded.schedule)
        .filter(schedule => {
            const storedSchedule = storedSchedules.find(item => item.id === schedule.id);
            return storedSchedule == null || schedule.version > storedSchedule.version;
        });

    const items = unionBy(mapResourcesToEntities(recentSchedules), storedSchedules, 'id')
        .filter(schedule => tasksWithoutSchedule.find(task => schedule.task.id === task.id) == null);

    return Object.assign({}, state, {items});
};

const getTaskIdsFromDayCardIds = (dayCardIds: string[], taskSchedules: TaskScheduleEntity[]): string[] =>
    taskSchedules
        .filter(item => item.slots)
        .filter(item => item.slots.find(slot => dayCardIds.includes(slot.dayCard.id)))
        .map(schedule => schedule.task.id);

export function taskScheduleReducer(state: TaskScheduleSlice = TASK_SCHEDULE_SLICE_INITIAL_STATE,
                                    action: TaskScheduleActions): TaskScheduleSlice {
    switch (action.type) {

        case TaskScheduleActionEnum.InitializeAll:
            return TASK_SCHEDULE_SLICE_INITIAL_STATE;

        case DayCardActionEnum.RequestAllDayCardsByTask:
            return Object.assign({}, state, {
                lists: updateListRequestStatusForTasks(state, [action.payload], RequestStatusEnum.progress),
            });

        case DayCardActionEnum.RequestAllDayCardsFromTasks:
            return Object.assign({}, state, {
                lists: updateListRequestStatusForTasks(state, action.payload, RequestStatusEnum.progress),
            });

        case DayCardActionEnum.UpdateSlots:
        case DayCardActionEnum.CreateOneDayCard:
        case TaskActionEnum.MoveOne:
        case TaskActionEnum.ResizeOne:
            return Object.assign({}, state, {
                lists: updateListRequestStatusForTasks(state, [action.payload.taskId], RequestStatusEnum.progress),
            });

        case TaskActionEnum.MoveAll:
            return Object.assign({}, state, {
                lists: updateListRequestStatusForTasks(state, action.payload.map(item => item.taskId), RequestStatusEnum.progress),
            });

        case DayCardActionEnum.ApproveAllDayCard: {
            const taskIds = getTaskIdsFromDayCardIds(action.payload, state.items);
            return Object.assign({}, state, {
                lists: updateListRequestStatusForTasks(state, taskIds, RequestStatusEnum.progress),
            });
        }

        case DayCardActionEnum.CreateOneDayCardFulfilled:
        case DayCardActionEnum.DeleteOneDayCardFulfilled:
        case DayCardActionEnum.RequestAllDayCardsByTaskFulfilled:
        case DayCardActionEnum.UpdateOneDayCardWithScheduleFulfilled:
        case DayCardActionEnum.UpdateSlotsFulfilled:
        case TaskActionEnum.RequestOneTaskScheduleByTaskIdFulfilled:
        case TaskActionEnum.ResizeOneFulfilled:
            return Object.assign({}, state, {
                items: unionBy(mapResourcesToEntitiesAndSortSlots([action.payload]), state.items, 'id'),
                lists: updateListRequestStatusForTasks(state, [action.payload.task.id], RequestStatusEnum.success),
            });

        case DayCardActionEnum.DeleteAllDayCardFulfilled:
        case DayCardActionEnum.RequestAllDayCardsFromTasksFulfilled: {
            const taskIds = action.payload.map(schedule => schedule.task.id);

            return Object.assign({}, state, {
                items: unionBy(mapResourcesToEntitiesAndSortSlots(action.payload), state.items, 'id'),
                lists: updateListRequestStatusForTasks(state, taskIds, RequestStatusEnum.success),
            });
        }

        case TaskActionEnum.RequestOneFulfilled:
        case TaskActionEnum.StartOneFulfilled:
        case TaskActionEnum.CloseOneFulfilled:
            return mergeScheduleIfRecent(state, [action.payload]);

        case TaskActionEnum.RequestAllFulfilled:
        case TaskActionEnum.RequestAllCalendarFulfilled:
        case TaskActionEnum.AssignAllFulfilled:
            return mergeScheduleIfRecent(state, action.payload.tasks);

        case TaskActionEnum.SendAllFulfilled:
        case TaskActionEnum.RequestAllByIdsFulfilled:
        case TaskActionEnum.CopyAllFulfilled:
            return mergeScheduleIfRecent(state, action.payload);

        case TaskActionEnum.DeleteOneFulfilled:
            return Object.assign({}, state, {
                items: state.items.filter(item => item.task.id !== action.payload),
            });

        case TaskActionEnum.DeleteAllFulfilled:
            return Object.assign({}, state, {
                items: state.items.filter(taskScheduleEntity => !action.payload.includes(taskScheduleEntity.task.id)),
            });

        case DayCardActionEnum.ApproveAllDayCardFulfilled: {
            const dayCardIds = action.payload.map(dayCard => dayCard.id);
            const taskIds = getTaskIdsFromDayCardIds(dayCardIds, state.items);

            return Object.assign({}, state, {
                lists: updateListRequestStatusForTasks(state, taskIds, RequestStatusEnum.success),
            });
        }

        case DayCardActionEnum.RequestAllDayCardsByTaskRejected:
        case DayCardActionEnum.UpdateSlotsRejected:
        case DayCardActionEnum.CreateOneDayCardRejected:
        case TaskActionEnum.MoveOneRejected:
        case TaskActionEnum.ResizeOneRejected:
            return Object.assign({}, state, {
                lists: updateListRequestStatusForTasks(state, [action.payload], RequestStatusEnum.error),
            });

        case TaskActionEnum.MoveAllRejected:
        case DayCardActionEnum.RequestAllDayCardsFromTasksRejected:
            return Object.assign({}, state, {
                lists: updateListRequestStatusForTasks(state, action.payload, RequestStatusEnum.error),
            });

        case DayCardActionEnum.ApproveAllDayCardRejected: {
            const taskIds = getTaskIdsFromDayCardIds(action.payload, state.items);

            return Object.assign({}, state, {
                lists: updateListRequestStatusForTasks(state, taskIds, RequestStatusEnum.error),
            });
        }

        case TaskActionEnum.MoveOneFulfilled:
            return Object.assign({}, state, {
                items: action.payload.schedule ?
                    unionBy(mapResourcesToEntitiesAndSortSlots([action.payload.schedule]), state.items, 'id') : state.items,
                lists: updateListRequestStatusForTasks(state, [action.payload.taskId], RequestStatusEnum.success),
            });

        case TaskActionEnum.MoveAllFulfilled:
        case TaskActionEnum.CreateAllFulfilled:
            return Object.assign({}, state, {
                items: unionBy(action.payload.reduce((items, payload) => payload.schedule ?
                    items.concat(mapResourcesToEntitiesAndSortSlots([payload.schedule])) : items, []), state.items, 'id'),
                lists: updateListRequestStatusForTasks(state, action.payload.map(item => item.taskId), RequestStatusEnum.success),
            });
        default:
            return state;
    }
}

export const TASK_SCHEDULE_REDUCER: ActionReducer<TaskScheduleSlice> = taskScheduleReducer;
