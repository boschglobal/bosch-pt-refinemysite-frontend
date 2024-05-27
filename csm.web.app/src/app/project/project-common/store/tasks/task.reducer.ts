/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {ActionReducer} from '@ngrx/store';
import {
    unionBy,
    uniq
} from 'lodash';

import {AbstractSelectionList} from '../../../../shared/misc/api/datatypes/abstract-selection-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {PaginatorData} from '../../../../shared/ui/paginator/paginator-data.datastructure';
import {TaskResource} from '../../api/tasks/resources/task.resource';
import {TaskEntity} from '../../entities/task/task.entity';
import {
    TaskConstraintsActionEnum,
    TaskConstraintsActions
} from '../task-constraints/task-constraints.actions';
import {ProjectTaskList} from './slice/project-task-list';
import {
    ProjectTaskActions,
    TaskActionEnum
} from './task.actions';
import {PROJECT_TASK_SLICE_INITIAL_STATE} from './task.initial-state';
import {ProjectTaskSlice} from './task.slice';

type ProjectTaskReducerActions =
    ProjectTaskActions |
    TaskConstraintsActions;

const mapTaskResourcesToTaskEntities = (tasks: TaskResource[]): TaskEntity[] => tasks.map(task => TaskEntity.fromResource(task));

export function projectTaskReducer(state: ProjectTaskSlice = PROJECT_TASK_SLICE_INITIAL_STATE,
                                   action: ProjectTaskReducerActions): ProjectTaskSlice {
    switch (action.type) {

        case TaskActionEnum.InitializeAll:
            return PROJECT_TASK_SLICE_INITIAL_STATE;

        case TaskActionEnum.InitializeAssignment:
            return Object.assign({}, state, {
                assignList: new AbstractSelectionList(),
            });

        case TaskActionEnum.InitializeSending:
            return Object.assign({}, state, {
                sendList: new AbstractSelectionList(),
            });

        case TaskActionEnum.InitializeCurrent:
            return Object.assign({}, state, {
                currentItem: new AbstractItem(),
            });

        case TaskActionEnum.InitializeCalendar:
            return Object.assign({}, state, {
                calendar: new ProjectTaskList(),
            });

        case TaskActionEnum.InitializeCalendarItems: {
            const {pagination, requestStatus, pages} = PROJECT_TASK_SLICE_INITIAL_STATE.calendar;

            return Object.assign<{}, ProjectTaskSlice, Partial<ProjectTaskSlice>>({}, state, {
                calendar: Object.assign<ProjectTaskList, ProjectTaskList, Partial<ProjectTaskList>>(new ProjectTaskList(), state.calendar, {
                    pagination,
                    requestStatus,
                    pages,
                }),
            });
        }

        case TaskActionEnum.InitializeListItems: {
            const {pagination, requestStatus} = PROJECT_TASK_SLICE_INITIAL_STATE.list;

            return Object.assign<{}, ProjectTaskSlice, Partial<ProjectTaskSlice>>({}, state, {
                list: Object.assign<ProjectTaskList, ProjectTaskList, Partial<ProjectTaskList>>(new ProjectTaskList(), state.list, {
                    pagination,
                    requestStatus,
                    pages: [[]],
                }),
            });
        }

        case TaskActionEnum.RequestAll:
            return Object.assign({}, state, {
                list: Object.assign(new ProjectTaskList(), state.list, {
                    requestStatus: RequestStatusEnum.progress,
                }),
            });

        case TaskActionEnum.RequestOneFulfilled:
        case TaskActionEnum.StartOneFulfilled:
        case TaskActionEnum.CloseOneFulfilled:
        case TaskActionEnum.AcceptOneFulfilled:
        case TaskActionEnum.ResetOneFulfilled:
        case TaskActionEnum.SendOneFulfilled:
            return Object.assign({}, state, {
                items: unionBy(mapTaskResourcesToTaskEntities([action.payload]), state.items, 'id'),
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success,
                }),
            });

        case TaskActionEnum.MoveOneFulfilled:
            return Object.assign({}, state, {
                items: action.payload.task
                    ? unionBy(mapTaskResourcesToTaskEntities([action.payload.task]), state.items, 'id')
                    : state.items,
                calendar: Object.assign(new ProjectTaskList(), state.calendar, {
                    requestStatus: RequestStatusEnum.success,
                }),
            });

        case TaskActionEnum.CreateAllFulfilled:
        case TaskActionEnum.MoveAllFulfilled: {
            const taskResources = action.payload
                .filter(item => item.task)
                .map(item => item.task);

            return Object.assign({}, state, {
                items: unionBy(mapTaskResourcesToTaskEntities(taskResources), state.items, 'id'),
                calendar: Object.assign(new ProjectTaskList(), state.calendar, {
                    requestStatus: RequestStatusEnum.success,
                }),
            });
        }

        case TaskActionEnum.RequestAllFulfilled:
            return Object.assign({}, state, {
                items: unionBy(mapTaskResourcesToTaskEntities(action.payload.tasks), state.items, 'id'),
                list: Object.assign(new ProjectTaskList(), state.list, {
                    pages: Object.assign([], state.list.pages, {
                        [action.payload.pageNumber]:
                            action.payload.tasks.map((item: any) => item.id),
                    }),
                    pagination: Object.assign(new PaginatorData(), state.list.pagination,
                        {entries: action.payload.totalElements}),
                    requestStatus: RequestStatusEnum.success,
                    _links: action.payload._links,
                }),
            });

        case TaskActionEnum.RequestAllRejected:
            return Object.assign({}, state, {
                list: Object.assign(new ProjectTaskList(), state.list, {
                    requestStatus: RequestStatusEnum.error,
                }),
            });

        case TaskActionEnum.RequestAllCalendar:
        case TaskActionEnum.MoveOne:
        case TaskActionEnum.ResizeOne:
        case TaskActionEnum.MoveAll:
        case TaskActionEnum.CreateAll:
        case TaskActionEnum.CopyAll:
        case TaskActionEnum.StartAll:
        case TaskActionEnum.CloseAll:
        case TaskActionEnum.AcceptAll:
        case TaskActionEnum.ResetAll:
        case TaskActionEnum.DeleteAll:
            return Object.assign({}, state, {
                calendar: Object.assign(new ProjectTaskList(), state.calendar, {
                    requestStatus: RequestStatusEnum.progress,
                }),
            });

        case TaskActionEnum.ResizeOneFulfilled:
            return Object.assign({}, state, {
                calendar: Object.assign(new ProjectTaskList(), state.calendar, {
                    requestStatus: RequestStatusEnum.success,
                }),
            });

        case TaskActionEnum.RequestAllCalendarFulfilled: {
            const {tasks, pageNumber, totalElements, _links} = action.payload;

            return Object.assign({}, state, {
                items: unionBy(mapTaskResourcesToTaskEntities(tasks), state.items, 'id'),
                calendar: Object.assign(new ProjectTaskList(), state.calendar, {
                    pages: Object.assign([], {
                        [pageNumber]: uniq(tasks.map(item => item.id)),
                    }),
                    pagination: Object.assign(new PaginatorData(), state.calendar.pagination, {entries: totalElements}),
                    requestStatus: RequestStatusEnum.success,
                    _links,
                }),
            });
        }

        case TaskActionEnum.RequestAllCalendarRejected:
        case TaskActionEnum.MoveOneRejected:
        case TaskActionEnum.ResizeOneRejected:
        case TaskActionEnum.MoveAllRejected:
        case TaskActionEnum.CreateAllRejected:
        case TaskActionEnum.CopyAllRejected:
        case TaskActionEnum.StartAllRejected:
        case TaskActionEnum.CloseAllRejected:
        case TaskActionEnum.AcceptAllRejected:
        case TaskActionEnum.ResetAllRejected:
        case TaskActionEnum.DeleteAllRejected:
            return Object.assign({}, state, {
                calendar: Object.assign(new ProjectTaskList(), state.calendar, {
                    requestStatus: RequestStatusEnum.error,
                }),
            });

        case TaskActionEnum.AssignAll:
            return Object.assign({}, state, {
                assignList: Object.assign(new AbstractSelectionList(), state.assignList, {
                    requestStatus: RequestStatusEnum.progress,
                }),
            });

        case TaskActionEnum.AssignAllFulfilled:
            return Object.assign({}, state, {
                items: unionBy(mapTaskResourcesToTaskEntities(action.payload.tasks), state.items, 'id'),
                assignList: Object.assign(new AbstractSelectionList(), {
                    requestStatus: RequestStatusEnum.success,
                }),
            });

        case TaskActionEnum.AssignAllRejected:
            return Object.assign({}, state, {
                assignList: Object.assign(new AbstractSelectionList(), state.assignList, {
                    requestStatus: RequestStatusEnum.error,
                }),
            });

        case TaskActionEnum.SendAll:
            return Object.assign({}, state, {
                sendList: Object.assign(new AbstractSelectionList(), state.sendList, {
                    requestStatus: RequestStatusEnum.progress,
                }),
                calendar: Object.assign(new ProjectTaskList(), state.calendar, {
                    requestStatus: RequestStatusEnum.progress,
                }),
            });

        case TaskActionEnum.SendAllFulfilled:
            return Object.assign({}, state, {
                items: unionBy(mapTaskResourcesToTaskEntities(action.payload), state.items, 'id'),
                sendList: Object.assign(new AbstractSelectionList(), {
                    requestStatus: RequestStatusEnum.success,
                }),
                calendar: Object.assign(new ProjectTaskList(), state.calendar, {
                    requestStatus: RequestStatusEnum.success,
                }),
            });

        case TaskActionEnum.SendAllRejected:
            return Object.assign({}, state, {
                sendList: Object.assign(new AbstractSelectionList(), state.sendList, {
                    requestStatus: RequestStatusEnum.error,
                }),
                calendar: Object.assign(new ProjectTaskList(), state.calendar, {
                    requestStatus: RequestStatusEnum.error,
                }),
            });

        case TaskActionEnum.SetCurrent:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    id: action.payload,
                }),
            });

        case TaskActionEnum.SetPage:
            return Object.assign({}, state, {
                list: Object.assign(new ProjectTaskList(), state.list, {
                    pagination: Object.assign(new PaginatorData(), state.list.pagination, {page: action.payload}),
                }),
            });

        case TaskActionEnum.SetItems:
            return Object.assign({}, state, {
                list: Object.assign(new ProjectTaskList(), state.list, {
                    pages: [],
                    pagination: Object.assign(new PaginatorData(), state.list.pagination, {items: action.payload}),
                }),
            });

        case TaskActionEnum.SetSort:
            return Object.assign({}, state, {
                list: Object.assign(new ProjectTaskList(), state.list, {
                    pages: [],
                    sort: action.payload,
                }),
            });

        case TaskActionEnum.SetFilters: {
            return Object.assign({}, state, {
                list: Object.assign(new ProjectTaskList(), state.list, {
                    pagination: Object.assign(new PaginatorData(), state.list.pagination, {page: 0}),
                    pages: [],
                    filters: action.payload,
                }),
            });
        }
        case TaskActionEnum.SetFilterPanelVisibility:
            return Object.assign({}, state, {
                list: Object.assign(new ProjectTaskList(), state.list, {
                    isFilterPanelOpen: action.payload,
                }),
            });

        case TaskActionEnum.SetCalendarPage:
            return Object.assign({}, state, {
                calendar: Object.assign(new ProjectTaskList(), state.calendar, {
                    pagination: Object.assign(new PaginatorData(), state.calendar.pagination, {page: action.payload}),
                }),
            });

        case TaskActionEnum.SetCalendarItems:
            return Object.assign({}, state, {
                calendar: Object.assign(new ProjectTaskList(), state.calendar, {
                    pages: [],
                    pagination: Object.assign(new PaginatorData(), state.calendar.pagination, {items: action.payload}),
                }),
            });

        case TaskActionEnum.SetCalendarSort:
            return Object.assign({}, state, {
                calendar: Object.assign(new ProjectTaskList(), state.calendar, {
                    pages: [],
                    sort: action.payload,
                }),
            });

        case TaskActionEnum.SetCalendarFilters: {
            return Object.assign({}, state, {
                calendar: Object.assign(new ProjectTaskList(), state.calendar, {
                    pagination: Object.assign(new PaginatorData(), state.calendar.pagination, {page: 0}),
                    filters: action.payload,
                }),
            });
        }
        case TaskActionEnum.SetCalendarFilterPanelVisibility:
            return Object.assign({}, state, {
                calendar: Object.assign(new ProjectTaskList(), state.calendar, {
                    isFilterPanelOpen: action.payload,
                }),
            });

        case TaskActionEnum.SetAssignIds:
            return Object.assign({}, state, {
                assignList: Object.assign(new AbstractSelectionList(), state.assignList, {ids: action.payload}),
            });

        case TaskActionEnum.SetAssignSelecting:
            return Object.assign({}, state, {
                assignList: Object.assign(new AbstractSelectionList(), state.assignList,
                    {isSelecting: action.payload}),
            });

        case TaskActionEnum.SetSendIds:
            return Object.assign({}, state, {
                sendList: Object.assign(new AbstractSelectionList(), state.sendList, {ids: action.payload}),
            });

        case TaskActionEnum.SetSendSelecting:
            return Object.assign({}, state, {
                sendList: Object.assign(new AbstractSelectionList(), state.sendList, {isSelecting: action.payload}),
            });

        case TaskActionEnum.RequestOne:
        case TaskActionEnum.CreateOne:
        case TaskActionEnum.UpdateOne:
        case TaskActionEnum.DeleteOne:
        case TaskActionEnum.StartOne:
        case TaskActionEnum.CloseOne:
        case TaskActionEnum.AcceptOne:
        case TaskActionEnum.ResetOne:
        case TaskActionEnum.SendOne:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.progress,
                }),
            });

        case TaskActionEnum.DeleteOneReset:
        case TaskActionEnum.CreateOneReset:
        case TaskActionEnum.UpdateOneReset:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.empty,
                }),
            });

        case TaskActionEnum.RequestOneRejected:
        case TaskActionEnum.CreateOneRejected:
        case TaskActionEnum.UpdateOneRejected:
        case TaskActionEnum.DeleteOneRejected:
        case TaskActionEnum.StartOneRejected:
        case TaskActionEnum.CloseOneRejected:
        case TaskActionEnum.AcceptOneRejected:
        case TaskActionEnum.ResetOneRejected:
        case TaskActionEnum.SendOneRejected:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.error,
                }),
            });

        case TaskActionEnum.DeleteOneFulfilled:
            return Object.assign({}, state, {
                items: state.items.filter(taskResource => taskResource.id !== action.payload),
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success,
                }),
            });

        case TaskActionEnum.DeleteAllFulfilled:
            return Object.assign({}, state, {
                items: state.items.filter(taskResource => !action.payload.includes(taskResource.id)),
                calendar: Object.assign(new ProjectTaskList(), state.calendar, {
                    requestStatus: RequestStatusEnum.success,
                }),
            });

        case TaskActionEnum.StartAllFulfilled:
        case TaskActionEnum.CloseAllFulfilled:
        case TaskActionEnum.AcceptAllFulfilled:
        case TaskActionEnum.ResetAllFulfilled:
        case TaskActionEnum.CopyAllFulfilled:
            return Object.assign({}, state, {
                items: unionBy(mapTaskResourcesToTaskEntities(action.payload), state.items, 'id'),
                calendar: Object.assign(new ProjectTaskList(), state.calendar, {
                    requestStatus: RequestStatusEnum.success,
                }),
            });

        case TaskActionEnum.CreateOneFulfilled:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success,
                }),
            });

        case TaskConstraintsActionEnum.RequestOneFulfilled:
        case TaskConstraintsActionEnum.UpdateOneFulfilled: {
            const {taskId, payload} = action;
            const task = state.items.find(item => item.id === taskId);
            const updatedTask = Object.assign({}, task, {
                _embedded: Object.assign({}, task._embedded, {
                    constraints: Object.assign({}, task._embedded.constraints, payload),
                }),
            });

            return Object.assign({}, state, {
                items: unionBy([updatedTask], state.items, 'id'),
            });
        }

        case TaskActionEnum.RequestAllByIdsFulfilled:
            return Object.assign({}, state, {
                items: unionBy(mapTaskResourcesToTaskEntities(action.payload), state.items, 'id'),
            });

        default:
            return state;
    }
}

export const PROJECT_TASK_REDUCER: ActionReducer<ProjectTaskSlice> = projectTaskReducer;
