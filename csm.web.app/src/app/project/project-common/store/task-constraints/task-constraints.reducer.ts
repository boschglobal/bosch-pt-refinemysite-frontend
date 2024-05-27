/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {ActionReducer} from '@ngrx/store';

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {TaskConstraintsResource} from '../../api/task-constraints/resources/task-constraints.resource';
import {TaskConstraints} from '../../models/task-constraints/task-constraints';
import {
    TaskConstraintsActionEnum,
    TaskConstraintsActions
} from './task-constraints.actions';
import {TASK_CONSTRAINTS_INITIAL_STATE} from './task-constraints.initial-state';
import {TaskConstraintsSlice} from './task-constraints.slice';

const updateTaskConstraints = (state: TaskConstraintsSlice,
                               taskId: string,
                               requestStatus: RequestStatusEnum,
                               payload?: TaskConstraintsResource): Map<string, TaskConstraints> => {
    const updatedTaskConstraints = payload
        ? Object.assign({}, new TaskConstraints(), TaskConstraints.fromTaskConstraintsResource(payload), {requestStatus})
        : Object.assign({}, new TaskConstraints(), {...state.lists[taskId]}, {requestStatus});

    return Object.assign(new Map(), state.lists, {
        [taskId]: updatedTaskConstraints,
    });
};

export function taskConstraintsReducer(state: TaskConstraintsSlice = TASK_CONSTRAINTS_INITIAL_STATE,
                                       action: TaskConstraintsActions): TaskConstraintsSlice {
    switch (action.type) {
        case TaskConstraintsActionEnum.InitializeAll: {
            return TASK_CONSTRAINTS_INITIAL_STATE;
        }

        case TaskConstraintsActionEnum.RequestOne:
        case TaskConstraintsActionEnum.UpdateOne: {
            return Object.assign({}, state, {
                lists: updateTaskConstraints(state, action.taskId, RequestStatusEnum.progress),
            });
        }

        case TaskConstraintsActionEnum.RequestOneFulfilled:
        case TaskConstraintsActionEnum.UpdateOneFulfilled: {
            return Object.assign({}, state, {
                lists: updateTaskConstraints(state, action.taskId, RequestStatusEnum.success, action.payload),
            });
        }

        case TaskConstraintsActionEnum.RequestOneRejected:
        case TaskConstraintsActionEnum.UpdateOneRejected: {
            return Object.assign({}, state, {
                lists: updateTaskConstraints(state, action.taskId, RequestStatusEnum.error),
            });
        }

        case TaskConstraintsActionEnum.UpdateOneReset: {
            return Object.assign({}, state, {
                lists: updateTaskConstraints(state, action.taskId, RequestStatusEnum.empty),
            });
        }

        default:
            return state;
    }
}

export const TASK_CONSTRAINT_REDUCER: ActionReducer<TaskConstraintsSlice> = taskConstraintsReducer;
