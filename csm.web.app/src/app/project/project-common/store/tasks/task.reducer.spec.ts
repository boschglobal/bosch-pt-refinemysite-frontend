/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';
import {cloneDeep} from 'lodash';
import {
    head,
    last
} from 'lodash';
import * as moment from 'moment';

import {
    MOCK_TASK_ENTITY,
    MOCK_TASK_RESOURCE,
    MOCK_TASKS_ENTITIES,
    MOCK_TASKS_RESOURCES
} from '../../../../../test/mocks/tasks';
import {AbstractSelectionList} from '../../../../shared/misc/api/datatypes/abstract-selection-list.datatype';
import {ResourceLink} from '../../../../shared/misc/api/datatypes/resource-link.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {PaginatorData} from '../../../../shared/ui/paginator/paginator-data.datastructure';
import {SortDirectionEnum} from '../../../../shared/ui/sorter/sort-direction.enum';
import {SorterData} from '../../../../shared/ui/sorter/sorter-data.datastructure';
import {TaskConstraintsResource} from '../../api/task-constraints/resources/task-constraints.resource';
import {TaskResource} from '../../api/tasks/resources/task.resource';
import {ProjectTaskListResource} from '../../api/tasks/resources/task-list.resource';
import {TasksSortField} from '../../api/tasks/task.service';
import {TaskEntity} from '../../entities/task/task.entity';
import {TaskStatusEnum} from '../../enums/task-status.enum';
import {TaskConstraintsActions} from '../task-constraints/task-constraints.actions';
import {ProjectTaskFilters} from './slice/project-task-filters';
import {ProjectTaskFiltersCriteria} from './slice/project-task-filters-criteria';
import {ProjectTaskList} from './slice/project-task-list';
import {
    CreateOrUpdateTaskFulfilledPayload,
    ProjectTaskActions,
    ResizeTaskPayload,
    TaskActionEnum,
} from './task.actions';
import {PROJECT_TASK_SLICE_INITIAL_STATE} from './task.initial-state';
import {PROJECT_TASK_REDUCER} from './task.reducer';
import {ProjectTaskSlice} from './task.slice';

describe('Project Task Reducer', () => {
    let initialState: ProjectTaskSlice;
    let midState: ProjectTaskSlice;
    let nextState: ProjectTaskSlice;

    const updateTaskConstraints = (task: TaskResource, constraints: TaskConstraintsResource): TaskResource =>
        Object.assign({}, task, {
            _embedded: Object.assign({}, task._embedded, {
                constraints: Object.assign({}, task._embedded.constraints, constraints),
            }),
        });

    beforeEach(() => {
        initialState = PROJECT_TASK_SLICE_INITIAL_STATE;
        nextState = cloneDeep(PROJECT_TASK_SLICE_INITIAL_STATE);
        midState = cloneDeep(PROJECT_TASK_SLICE_INITIAL_STATE);
    });

    it('should handle InitializeAll', () => {
        const initializeProjectTasksAction: Action = {type: TaskActionEnum.InitializeAll};
        expect(PROJECT_TASK_REDUCER(initialState, initializeProjectTasksAction)).toEqual(initialState);
    });

    it('should handle InitializeAssignment', () => {
        const action: Action = new ProjectTaskActions.Initialize.Assignment();
        nextState.assignList = new AbstractSelectionList();
        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle InitializeSending', () => {
        const action: Action = new ProjectTaskActions.Initialize.Sending();
        nextState.sendList = new AbstractSelectionList();
        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle InitializeCurrent', () => {
        const action: Action = new ProjectTaskActions.Initialize.Current();
        nextState.currentItem = new AbstractItem();
        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle InitializeCalendar', () => {
        const action: Action = new ProjectTaskActions.Initialize.Calendar();
        nextState.calendar = new ProjectTaskList();
        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle InitializeCalendarItems', () => {
        const action: Action = new ProjectTaskActions.Initialize.CalendarItems();
        const valuesToKeep: Partial<ProjectTaskList> = {
            filters: new ProjectTaskFilters(new ProjectTaskFiltersCriteria(), true),
            isFilterPanelOpen: true,
            sort: new SorterData<TasksSortField>('name', SortDirectionEnum.desc),
            _links: {
                self: {href: ''},
                create: {href: ''},
            },
        };

        midState.calendar = Object.assign(new ProjectTaskList(), initialState.calendar,
            {
                ...valuesToKeep,
                pages: [new Array(100).fill(null)],
                pagination: new PaginatorData(50),
                requestStatus: RequestStatusEnum.success,
            });

        nextState.calendar = Object.assign(new ProjectTaskList(), initialState.calendar, valuesToKeep);

        expect(PROJECT_TASK_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle InitializeListItems', () => {
        const action: Action = new ProjectTaskActions.Initialize.ListItems();
        const valuesToKeep: Partial<ProjectTaskList> = {
            filters: new ProjectTaskFilters(new ProjectTaskFiltersCriteria(), true),
            isFilterPanelOpen: true,
            sort: new SorterData<TasksSortField>('name', SortDirectionEnum.desc),
            _links: {
                self: {href: ''},
                create: {href: ''},
            },
        };

        midState.list = Object.assign(new ProjectTaskList(), initialState.list,
            {
                ...valuesToKeep,
                pages: [new Array(100).fill(null)],
                pagination: new PaginatorData(50),
                requestStatus: RequestStatusEnum.success,
            });

        nextState.list = Object.assign(new ProjectTaskList(), initialState.list, {
            ...valuesToKeep,
            pages: [[]],
        });

        expect(PROJECT_TASK_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle RequestOne', () => {
        const action: Action = {type: TaskActionEnum.RequestOne};

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle RequestOneFulfilled', () => {
        const action: ProjectTaskActions.Request.OneFulfilled = {
            type: TaskActionEnum.RequestOneFulfilled,
            payload: MOCK_TASK_RESOURCE,
        };

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
        });

        nextState.items = [MOCK_TASK_ENTITY];
        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle RequestOneRejected', () => {
        const action: Action = {type: TaskActionEnum.RequestOneRejected};

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle RequestAll', () => {
        const requestTasksAction: Action = {type: TaskActionEnum.RequestAll};

        nextState.list = Object.assign(new ProjectTaskList(), nextState.list, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PROJECT_TASK_REDUCER(initialState, requestTasksAction)).toEqual(nextState);
    });

    it('should handle RequestAllFulfilled', () => {
        const paginatorItems = 100;
        const paginatorPage = 0;
        const paginatorEntries = 100;
        const resource: ProjectTaskListResource = {
            tasks: MOCK_TASKS_RESOURCES,
            totalElements: paginatorEntries,
            pageNumber: paginatorPage,
            pageSize: paginatorItems,
            totalPages: 10,
            _links: {
                self: {
                    href: 'http://test.de',
                },
                create: {
                    href: 'http://test.de',
                },
                assign: {
                    href: 'http://test.de',
                },
                send: {
                    href: 'http://test.de',
                },
            },
        };

        const requestTasksFulfilledAction: ProjectTaskActions.Request.AllFulfilled = {
            type: TaskActionEnum.RequestAllFulfilled,
            payload: resource,
        };

        nextState.list = Object.assign(new ProjectTaskList(), nextState.list, {
            pages: Object.assign([], nextState.list.pages, {[paginatorPage]: MOCK_TASKS_RESOURCES.map((task: TaskResource) => task.id)}),
            pagination: new PaginatorData(paginatorItems, paginatorPage, paginatorEntries),
            requestStatus: RequestStatusEnum.success,
            _links: resource._links,
        });

        nextState.items = MOCK_TASKS_ENTITIES;
        expect(PROJECT_TASK_REDUCER(initialState, requestTasksFulfilledAction)).toEqual(nextState);
    });

    it('should handle RequestAllRejected', () => {
        const requestTasksRejectedAction: Action = {type: TaskActionEnum.RequestAllRejected};

        nextState.list = Object.assign(new ProjectTaskList(), nextState.list, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(PROJECT_TASK_REDUCER(initialState, requestTasksRejectedAction)).toEqual(nextState);
    });

    it('should handle RequestAllCalendar', () => {
        const action: Action = {type: TaskActionEnum.RequestAllCalendar};

        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle RequestAllCalendarFulfilled', () => {
        const paginatorItems = 100;
        const paginatorPage = 0;
        const paginatorEntries = 100;
        const resource: ProjectTaskListResource = {
            tasks: MOCK_TASKS_RESOURCES,
            totalElements: paginatorEntries,
            pageNumber: paginatorPage,
            pageSize: paginatorItems,
            totalPages: 10,
            _links: {
                self: {
                    href: 'http://test.de',
                },
                create: {
                    href: 'http://test.de',
                },
                assign: {
                    href: 'http://test.de',
                },
                send: {
                    href: 'http://test.de',
                },
            },
        };

        const action: ProjectTaskActions.Request.AllCalendarFulfilled = {
            type: TaskActionEnum.RequestAllCalendarFulfilled,
            payload: resource,
        };

        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            pages: Object.assign([], initialState.calendar.pages,
                {[paginatorPage]: MOCK_TASKS_RESOURCES.map((task: TaskResource) => task.id)}),
            pagination: Object.assign(new PaginatorData(), initialState.calendar.pagination, {entries: paginatorEntries}),
            requestStatus: RequestStatusEnum.success,
            _links: resource._links,
        });

        nextState.items = MOCK_TASKS_ENTITIES;
        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should overwrite last collection of tasks when handling RequestAllCalendarFulfilled', () => {
        const paginatorItems = 500;
        const paginatorPage = 0;
        const paginatorEntries = 100;
        const resource: ProjectTaskListResource = {
            tasks: MOCK_TASKS_RESOURCES,
            totalElements: paginatorEntries,
            pageNumber: paginatorPage,
            pageSize: paginatorItems,
            totalPages: 1,
            _links: {
                self: {
                    href: 'http://test.de',
                },
                create: {
                    href: 'http://test.de',
                },
                assign: {
                    href: 'http://test.de',
                },
                send: {
                    href: 'http://test.de',
                },
            },
        };

        const action: ProjectTaskActions.Request.AllCalendarFulfilled = {
            type: TaskActionEnum.RequestAllCalendarFulfilled,
            payload: resource,
        };

        midState.calendar = Object.assign(new ProjectTaskList(), initialState.calendar, {
            pages: Object.assign([], initialState.calendar, {
                [0]: new Array(100).fill(null),
                [1]: new Array(50).fill(null),
            }),
            pagination: new PaginatorData(paginatorItems, 0, 150),
            requestStatus: RequestStatusEnum.success,
            _links: {},
        });

        nextState.calendar = Object.assign(new ProjectTaskList(), midState.calendar, {
            pages: Object.assign([], {[paginatorPage]: MOCK_TASKS_RESOURCES.map((task: TaskResource) => task.id)}),
            pagination: Object.assign(new PaginatorData(), initialState.calendar.pagination, {entries: paginatorEntries}),
            requestStatus: RequestStatusEnum.success,
            _links: resource._links,
        });

        nextState.items = MOCK_TASKS_ENTITIES;
        expect(PROJECT_TASK_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle RequestAllCalendarRejected', () => {
        const action: Action = {type: TaskActionEnum.RequestAllCalendarRejected};

        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle AssignAll', () => {
        const action: Action = {type: TaskActionEnum.AssignAll};

        nextState.assignList = Object.assign(new AbstractSelectionList(), nextState.assignList, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle AssignAllFulfilled', () => {
        const payload: ProjectTaskListResource = Object.assign(new ProjectTaskListResource(), {tasks: []});
        const action: ProjectTaskActions.Assign.AllFulfilled = {
            type: TaskActionEnum.AssignAllFulfilled,
            payload,
        };

        nextState.assignList = Object.assign(new AbstractSelectionList(), nextState.assignList, {
            requestStatus: RequestStatusEnum.success,
            isSelecting: false,
            ids: [],
        });

        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle AssignAllRejected', () => {
        const action: Action = {type: TaskActionEnum.AssignAllRejected};

        nextState.assignList = Object.assign(new AbstractSelectionList(), nextState.assignList, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle SendAll', () => {
        const action: Action = {type: TaskActionEnum.SendAll};

        nextState.sendList = Object.assign(new AbstractSelectionList(), nextState.sendList, {
            requestStatus: RequestStatusEnum.progress,
        });
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle SendAllFulfilled', () => {
        const action: ProjectTaskActions.Send.AllFulfilled = {
            type: TaskActionEnum.SendAllFulfilled,
            payload: [],
        };

        nextState.sendList = Object.assign(new AbstractSelectionList(), nextState.sendList, {
            requestStatus: RequestStatusEnum.success,
            isSelecting: false,
            ids: [],
        });
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.success,
        });

        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle SendAllRejected', () => {
        const action: Action = {type: TaskActionEnum.SendAllRejected};

        nextState.sendList = Object.assign(new AbstractSelectionList(), nextState.sendList, {
            requestStatus: RequestStatusEnum.error,
        });
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle StartOne', () => {
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Start.One(null))).toEqual(nextState);
    });

    it('should handle StartOneFulfilled', () => {
        const startedTask = Object.assign(new TaskResource(), MOCK_TASK_RESOURCE, {status: TaskStatusEnum.STARTED});
        const startedTaskEntity = TaskEntity.fromResource(startedTask);

        midState.items = [MOCK_TASK_ENTITY];

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
        });
        nextState.items = [startedTaskEntity];

        expect(PROJECT_TASK_REDUCER(midState, new ProjectTaskActions.Start.OneFulfilled(startedTask))).toEqual(nextState);
    });

    it('should handle StartOneRejected', () => {
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Start.OneRejected())).toEqual(nextState);
    });

    it('should handle SendOne', () => {
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Send.One(null))).toEqual(nextState);
    });

    it('should handle SendOneFulfilled', () => {
        const sentTask = Object.assign(new TaskResource(), MOCK_TASK_RESOURCE, {status: TaskStatusEnum.OPEN});
        const sendTaskEntity = TaskEntity.fromResource(sentTask);

        midState.items = [MOCK_TASK_ENTITY];

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
        });
        nextState.items = [sendTaskEntity];

        expect(PROJECT_TASK_REDUCER(midState, new ProjectTaskActions.Send.OneFulfilled(sentTask))).toEqual(nextState);
    });

    it('should handle SendOneRejected', () => {
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Send.OneRejected())).toEqual(nextState);
    });

    it('should handle AcceptOne', () => {
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Accept.One(null))).toEqual(nextState);
    });

    it('should handle AcceptOneFulfilled', () => {
        const acceptedTask = Object.assign(new TaskResource(), MOCK_TASK_RESOURCE, {status: TaskStatusEnum.ACCEPTED});
        const acceptedTaskEntity = TaskEntity.fromResource(acceptedTask);

        midState.items = [MOCK_TASK_ENTITY];

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
        });
        nextState.items = [acceptedTaskEntity];

        expect(PROJECT_TASK_REDUCER(midState, new ProjectTaskActions.Accept.OneFulfilled(acceptedTask))).toEqual(nextState);
    });

    it('should handle AcceptOneRejected', () => {
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Accept.OneRejected())).toEqual(nextState);
    });

    it('should handle CloseOne', () => {
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Close.One(null))).toEqual(nextState);
    });

    it('should handle CloseOneFulfilled', () => {
        const closedTask = Object.assign(new TaskResource(), MOCK_TASK_RESOURCE, {status: TaskStatusEnum.CLOSED});
        const closedTaskEntity = TaskEntity.fromResource(closedTask);

        midState.items = [MOCK_TASK_ENTITY];

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
        });
        nextState.items = [closedTaskEntity];

        expect(PROJECT_TASK_REDUCER(midState, new ProjectTaskActions.Close.OneFulfilled(closedTask))).toEqual(nextState);
    });

    it('should handle CloseOneRejected', () => {
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Close.OneRejected())).toEqual(nextState);
    });

    it('should handle ResetOne', () => {
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Reset.One(null))).toEqual(nextState);
    });

    it('should handle ResetOneFulfilled', () => {
        const resetTask = Object.assign(new TaskResource(), MOCK_TASK_RESOURCE, {status: TaskStatusEnum.OPEN});
        const resetTaskEntity = TaskEntity.fromResource(resetTask);

        midState.items = [MOCK_TASK_ENTITY];

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
        });
        nextState.items = [resetTaskEntity];

        expect(PROJECT_TASK_REDUCER(midState, new ProjectTaskActions.Reset.OneFulfilled(resetTask))).toEqual(nextState);
    });

    it('should handle ResetOneRejected', () => {
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Reset.OneRejected())).toEqual(nextState);
    });

    it('should handle SetCurrent', () => {
        const taskId = '123';
        const action: ProjectTaskActions.Set.Current = {
            type: TaskActionEnum.SetCurrent,
            payload: taskId,
        };

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            id: taskId,
        });

        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle SetPage', () => {
        const paginatorItems = 100;
        const paginatorPage = 2;
        const paginatorEntries = 0;
        const setProjectTasksPageAction: ProjectTaskActions.Set.Page = {
            type: TaskActionEnum.SetPage,
            payload: paginatorPage,
        };

        nextState.list = Object.assign(new ProjectTaskList(), nextState.list, {
            pagination: new PaginatorData(paginatorItems, paginatorPage, paginatorEntries),
        });

        expect(PROJECT_TASK_REDUCER(initialState, setProjectTasksPageAction)).toEqual(nextState);
    });

    it('should handle SetItems', () => {
        const paginatorItems = 100;
        const paginatorPage = 0;
        const paginatorEntries = 0;
        const setTasksItemsAction: ProjectTaskActions.Set.Items = {
            type: TaskActionEnum.SetItems,
            payload: paginatorItems,
        };

        nextState.list = Object.assign(new ProjectTaskList(), nextState.list, {
            pagination: new PaginatorData(paginatorItems, paginatorPage, paginatorEntries),
        });

        expect(PROJECT_TASK_REDUCER(initialState, setTasksItemsAction)).toEqual(nextState);
    });

    it('should handle SetSort', () => {
        const sorterData: SorterData = new SorterData('title', SortDirectionEnum.desc);
        const setTasksSortAction: ProjectTaskActions.Set.Sort = {
            type: TaskActionEnum.SetSort,
            payload: sorterData,
        };

        nextState.list = Object.assign(new ProjectTaskList(), nextState.list, {
            sort: sorterData,
        });

        expect(PROJECT_TASK_REDUCER(initialState, setTasksSortAction)).toEqual(nextState);
    });

    it('should handle SetFilters', () => {
        const filters: ProjectTaskFilters = new ProjectTaskFilters();
        filters.useCriteria = false;
        filters.highlight = true;

        const action = new ProjectTaskActions.Set.Filters(filters);

        nextState.list = Object.assign(new ProjectTaskList(), nextState.list, {
            pagination: Object.assign(new PaginatorData(), nextState.list.pagination, {page: 0}),
            filters,
        });

        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle SetFilterPanelVisibility', () => {
        const payload = true;
        const action: ProjectTaskActions.Set.FilterPanelVisibility = {
            type: TaskActionEnum.SetFilterPanelVisibility,
            payload,
        };

        nextState.list = Object.assign(new ProjectTaskList(), nextState.list, {
            isFilterPanelOpen: payload,
        });

        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle SetCalendarPage', () => {
        const paginatorItems = 500;
        const paginatorPage = 2;
        const paginatorEntries = 0;
        const setProjectTasksPageAction: ProjectTaskActions.Set.CalendarPage = {
            type: TaskActionEnum.SetCalendarPage,
            payload: paginatorPage,
        };

        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            pagination: new PaginatorData(paginatorItems, paginatorPage, paginatorEntries),
        });

        expect(PROJECT_TASK_REDUCER(initialState, setProjectTasksPageAction)).toEqual(nextState);
    });

    it('should handle SetCalendarItems', () => {
        const paginatorItems = 100;
        const paginatorPage = 0;
        const paginatorEntries = 0;
        const setTasksItemsAction: ProjectTaskActions.Set.CalendarItems = {
            type: TaskActionEnum.SetCalendarItems,
            payload: paginatorItems,
        };

        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            pagination: new PaginatorData(paginatorItems, paginatorPage, paginatorEntries),
        });

        expect(PROJECT_TASK_REDUCER(initialState, setTasksItemsAction)).toEqual(nextState);
    });

    it('should handle SetCalendarSort', () => {
        const sorterData: SorterData<TasksSortField> = new SorterData<TasksSortField>('name', SortDirectionEnum.desc);
        const action: ProjectTaskActions.Set.CalendarSort = {
            type: TaskActionEnum.SetCalendarSort,
            payload: sorterData,
        };

        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            sort: sorterData,
        });

        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle SetCalendarFilters', () => {
        const filters: ProjectTaskFilters = new ProjectTaskFilters();
        filters.useCriteria = false;
        filters.highlight = true;

        const action = new ProjectTaskActions.Set.CalendarFilters(filters);

        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            pagination: Object.assign(new PaginatorData(), nextState.calendar.pagination, {page: 0}),
            filters,
        });

        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle SetCalendarFilterPanelVisibility', () => {
        const payload = true;
        const action: ProjectTaskActions.Set.CalendarFilterPanelVisibility = {
            type: TaskActionEnum.SetCalendarFilterPanelVisibility,
            payload,
        };

        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            isFilterPanelOpen: payload,
        });

        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle SetAssignSelecting', () => {
        const payload = true;
        const action: ProjectTaskActions.Set.AssignSelecting = {
            type: TaskActionEnum.SetAssignSelecting,
            payload,
        };

        nextState.assignList = Object.assign(new AbstractSelectionList(), nextState.assignList, {
            isSelecting: payload,
        });

        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle SetAssignIds', () => {
        const payload: string[] = ['a', 'b', 'c'];
        const action: ProjectTaskActions.Set.AssignIds = {
            type: TaskActionEnum.SetAssignIds,
            payload,
        };

        nextState.assignList = Object.assign(new AbstractSelectionList(), nextState.assignList, {
            ids: payload,
        });

        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle initial state', () => {
        const defaultAction: Action = {type: 'DEFAULT'};
        expect(PROJECT_TASK_REDUCER(undefined, defaultAction)).toEqual(initialState);
    });

    it('should handle CreateOneReset', () => {
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
        });
        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Create.OneReset())).toEqual(nextState);
    });

    it('should handle CreateOne', () => {
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });
        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Create.One(null, 'calendar'))).toEqual(nextState);
    });

    it('should handle CreateOneRejected', () => {
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });
        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Create.OneRejected())).toEqual(nextState);
    });

    it('should handle SetSendIds', () => {
        const payload: string[] = ['1', '2', '3'];
        const action: ProjectTaskActions.Set.SendIds = {
            type: TaskActionEnum.SetSendIds,
            payload,
        };

        nextState.sendList = Object.assign(new AbstractSelectionList(), nextState.sendList, {
            ids: payload,
        });

        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle SetSendSelecting', () => {
        const payload = false;
        const action: ProjectTaskActions.Set.SendSelecting = {
            type: TaskActionEnum.SetSendSelecting,
            payload,
        };
        nextState.sendList = Object.assign(new AbstractSelectionList(), nextState.sendList, {
            isSelecting: payload,
        });
        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CreateOneFulfilled', () => {
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
        });
        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Create.OneFulfilled('calendar'))).toEqual(nextState);
    });

    it('should handle UpdateOne', () => {
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });
        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Update.One(null))).toEqual(nextState);
    });

    it('should handle UpdateOneReset', () => {
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
        });
        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Update.OneReset())).toEqual(nextState);
    });

    it('should handle UpdateOneRejected', () => {
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });
        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Update.OneRejected())).toEqual(nextState);
    });

    it('should handle DeleteOne', () => {
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });
        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Delete.One(null))).toEqual(nextState);
    });

    it('should handle DeleteOneFulfilled', () => {
        midState.items = [MOCK_TASK_ENTITY];

        nextState.items = [];
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
        });
        expect(PROJECT_TASK_REDUCER(midState, new ProjectTaskActions.Delete.OneFulfilled(MOCK_TASK_RESOURCE.id))).toEqual(nextState);
    });

    it('should handle DeleteOneRejected', () => {
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });
        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Delete.OneRejected())).toEqual(nextState);
    });

    it('should handle DeleteOneReset', () => {
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
        });
        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Delete.OneReset())).toEqual(nextState);
    });

    it('should handle DeleteAll', () => {
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Delete.All(null))).toEqual(nextState);
    });

    it('should handle DeleteAllFulfilled', () => {
        const listOfTasks: TaskEntity[] = Array.from({length: 5}, (_, index): TaskEntity => ({
            ...MOCK_TASK_ENTITY,
            id: index.toString(),
        }));
        const idsToDelete: string[] = [head(listOfTasks).id, last(listOfTasks).id];

        midState.items = listOfTasks;

        nextState.items = listOfTasks.slice(1, listOfTasks.length - 1);
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.success,
        });
        expect(PROJECT_TASK_REDUCER(midState, new ProjectTaskActions.Delete.AllFulfilled(idsToDelete))).toEqual(nextState);
    });

    it('should handle DeleteAllRejected', () => {
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.error,
        });
        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Delete.AllRejected())).toEqual(nextState);
    });

    it('should handle MoveOne', () => {
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Move.One(null))).toEqual(nextState);
    });

    it('should handle MoveOneFulfilled with a task update', () => {
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.success,
        });
        nextState.items = [MOCK_TASK_ENTITY];

        const payloadFulfilled: CreateOrUpdateTaskFulfilledPayload = {
            taskId: null,
            task: MOCK_TASK_RESOURCE,
            schedule: null,
        };

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Move.OneFulfilled(payloadFulfilled))).toEqual(nextState);
    });

    it('should handle MoveOneFulfilled without a task update', () => {
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.success,
        });

        const payloadFulfilled: CreateOrUpdateTaskFulfilledPayload = {
            taskId: null,
            task: null,
            schedule: null,
        };

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Move.OneFulfilled(payloadFulfilled))).toEqual(nextState);
    });

    it('should handle MoveOneRejected', () => {
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Move.OneRejected(null))).toEqual(nextState);
    });

    it('should handle ResizeOne', () => {
        const payload: ResizeTaskPayload = {
            start: moment(),
            end: moment(),
            taskId: MOCK_TASK_RESOURCE.id,
        };
        const action = new ProjectTaskActions.Resize.One(payload);

        nextState.calendar = Object.assign(new ProjectTaskList(), initialState.calendar, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ResizeOneFulfilled', () => {
        const action = new ProjectTaskActions.Resize.OneFulfilled(null);

        nextState.calendar = Object.assign(new ProjectTaskList(), initialState.calendar, {
            requestStatus: RequestStatusEnum.success,
        });

        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ResizeOneRejected', () => {
        const action = new ProjectTaskActions.Resize.OneRejected(null);

        nextState.calendar = Object.assign(new ProjectTaskList(), initialState.calendar, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle MoveAll', () => {
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Move.All(null))).toEqual(nextState);
    });

    it('should handle MoveAllFulfilled with a task update', () => {
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.success,
        });
        nextState.items = MOCK_TASKS_ENTITIES;

        const payloadFulfilled: CreateOrUpdateTaskFulfilledPayload[] = MOCK_TASKS_RESOURCES.map(resource => ({
            taskId: resource.id,
            task: resource,
            schedule: null,
        }));

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Move.AllFulfilled(payloadFulfilled))).toEqual(nextState);
    });

    it('should handle MoveAllFulfilled without any task update', () => {
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.success,
        });

        const payloadFulfilled: CreateOrUpdateTaskFulfilledPayload[] = [{
            taskId: null,
            task: null,
            schedule: null,
        }, {
            taskId: null,
            task: null,
            schedule: null,
        }];

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Move.AllFulfilled(payloadFulfilled))).toEqual(nextState);
    });

    it('should handle MoveAllRejected', () => {
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Move.AllRejected(null))).toEqual(nextState);
    });

    it('should handle CreateAll', () => {
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Create.All(null))).toEqual(nextState);
    });

    it('should handle CreateAllFulfilled', () => {
        const payloadFulfilled: CreateOrUpdateTaskFulfilledPayload[] = MOCK_TASKS_RESOURCES.map(resource => ({
            taskId: resource.id,
            task: resource,
            schedule: null,
        }));

        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.success,
        });
        nextState.items = MOCK_TASKS_ENTITIES;

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Create.AllFulfilled(payloadFulfilled))).toEqual(nextState);
    });

    it('should handle CreateAllRejected', () => {
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Create.AllRejected())).toEqual(nextState);
    });

    it('should handle CopyAll', () => {
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Copy.All(null))).toEqual(nextState);
    });

    it('should handle CopyAllFulfilled', () => {
        const payloadFulfilled: TaskResource[] = MOCK_TASKS_RESOURCES;

        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.success,
        });
        nextState.items = MOCK_TASKS_ENTITIES;

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Copy.AllFulfilled(payloadFulfilled))).toEqual(nextState);
    });

    it('should handle CopyAllRejected', () => {
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Copy.AllRejected())).toEqual(nextState);
    });

    it('should handle ConstraintActions.Update.OneTaskFulfilled()', () => {
        const newTaskConstraints: TaskConstraintsResource = {
            items: [{key: 'EQUIPMENT', name: 'EQUIPMENT'}],
            version: 1,
            taskId: MOCK_TASK_RESOURCE.id,
            _links: {self: new ResourceLink()},
        };
        const action = new TaskConstraintsActions.Update.OneFulfilled(MOCK_TASK_RESOURCE.id, newTaskConstraints);
        const updatedTask = updateTaskConstraints(MOCK_TASK_RESOURCE, newTaskConstraints);
        const updatedTaskEntity = TaskEntity.fromResource(updatedTask);

        midState.items = [MOCK_TASK_ENTITY];

        nextState.items = [updatedTaskEntity];

        expect(PROJECT_TASK_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle ConstraintActions.Update.RequestOneFulfilled()', () => {
        const newTaskConstraints: TaskConstraintsResource = {
            items: [{key: 'EQUIPMENT', name: 'EQUIPMENT'}],
            version: 1,
            taskId: MOCK_TASK_RESOURCE.id,
            _links: {self: new ResourceLink()},
        };
        const action = new TaskConstraintsActions.Request.OneFulfilled(MOCK_TASK_RESOURCE.id, newTaskConstraints);
        const updatedTask = updateTaskConstraints(MOCK_TASK_RESOURCE, newTaskConstraints);
        const updatedTaskEntity = TaskEntity.fromResource(updatedTask);

        midState.items = [MOCK_TASK_ENTITY];

        nextState.items = [updatedTaskEntity];

        expect(PROJECT_TASK_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle ProjectTaskActions.Request.AllByIdsFulfilled', () => {
        const action = new ProjectTaskActions.Request.AllByIdsFulfilled([MOCK_TASK_RESOURCE]);

        nextState.items = [MOCK_TASK_ENTITY];

        expect(PROJECT_TASK_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle StartAll', () => {
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Start.All(null))).toEqual(nextState);
    });

    it('should handle StartAllFulfilled', () => {
        const initialTaskResources = MOCK_TASKS_RESOURCES;
        const initialTaskEntities = MOCK_TASKS_ENTITIES;
        const updatedTaskResources: TaskResource[] = initialTaskResources.map(task => ({...task, status: TaskStatusEnum.STARTED}));
        const updatedTaskEntities = updatedTaskResources.map(task => TaskEntity.fromResource(task));

        midState.items = initialTaskEntities;

        nextState.items = updatedTaskEntities;
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.success,
        });
        expect(PROJECT_TASK_REDUCER(midState, new ProjectTaskActions.Start.AllFulfilled(updatedTaskResources))).toEqual(nextState);
    });

    it('should handle StartAllRejected', () => {
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.error,
        });
        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Start.AllRejected())).toEqual(nextState);
    });

    it('should handle CloseAll', () => {
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Close.All(null))).toEqual(nextState);
    });

    it('should handle CloseAllFulfilled', () => {
        const initialTaskResources = MOCK_TASKS_RESOURCES;
        const initialTaskEntities = MOCK_TASKS_ENTITIES;
        const updatedTaskResources: TaskResource[] = initialTaskResources.map(task => ({...task, status: TaskStatusEnum.CLOSED}));
        const updatedTaskEntities = updatedTaskResources.map(task => TaskEntity.fromResource(task));

        midState.items = initialTaskEntities;

        nextState.items = updatedTaskEntities;
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.success,
        });
        expect(PROJECT_TASK_REDUCER(midState, new ProjectTaskActions.Close.AllFulfilled(updatedTaskResources))).toEqual(nextState);
    });

    it('should handle CloseAllRejected', () => {
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.error,
        });
        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Close.AllRejected())).toEqual(nextState);
    });

    it('should handle AcceptAll', () => {
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Accept.All(null))).toEqual(nextState);
    });

    it('should handle AcceptAllFulfilled', () => {
        const initialTaskResources = MOCK_TASKS_RESOURCES;
        const initialTaskEntities = MOCK_TASKS_ENTITIES;
        const updatedTaskResources: TaskResource[] = initialTaskResources.map(task => ({...task, status: TaskStatusEnum.ACCEPTED}));
        const updatedTaskEntities = updatedTaskResources.map(task => TaskEntity.fromResource(task));

        midState.items = initialTaskEntities;

        nextState.items = updatedTaskEntities;
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.success,
        });
        expect(PROJECT_TASK_REDUCER(midState, new ProjectTaskActions.Accept.AllFulfilled(updatedTaskResources))).toEqual(nextState);
    });

    it('should handle AcceptAllRejected', () => {
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.error,
        });
        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Accept.AllRejected())).toEqual(nextState);
    });

    it('should handle ResetAll', () => {
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Reset.All(null))).toEqual(nextState);
    });

    it('should handle ResetAllFulfilled', () => {
        const initialTaskResources = MOCK_TASKS_RESOURCES;
        const initialTaskEntities = MOCK_TASKS_ENTITIES;
        const updatedTaskResources: TaskResource[] = initialTaskResources.map(task => ({...task, status: TaskStatusEnum.OPEN}));
        const updatedTaskEntities = updatedTaskResources.map(task => TaskEntity.fromResource(task));

        midState.items = initialTaskEntities;

        nextState.items = updatedTaskEntities;
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.success,
        });
        expect(PROJECT_TASK_REDUCER(midState, new ProjectTaskActions.Reset.AllFulfilled(updatedTaskResources))).toEqual(nextState);
    });

    it('should handle ResetAllRejected', () => {
        nextState.calendar = Object.assign(new ProjectTaskList(), nextState.calendar, {
            requestStatus: RequestStatusEnum.error,
        });
        expect(PROJECT_TASK_REDUCER(initialState, new ProjectTaskActions.Reset.AllRejected())).toEqual(nextState);
    });
});
