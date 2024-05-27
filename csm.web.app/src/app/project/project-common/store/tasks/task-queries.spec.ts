/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {select} from '@ngrx/store';
import {
    MockStore,
    provideMockStore,
} from '@ngrx/store/testing';
import {cloneDeep} from 'lodash';
import {take} from 'rxjs/operators';

import {MOCK_ATTACHMENT_1} from '../../../../../test/mocks/attachments';
import {
    MOCK_TASK,
    MOCK_TASK_ENTITY,
    MOCK_TASK_ENTITY_WITHOUT_SCHEDULE,
    MOCK_TASK_RESOURCE,
    MOCK_TASK_WITHOUT_SCHEDULE
} from '../../../../../test/mocks/tasks';
import {State} from '../../../../app.reducers';
import {AbstractSelectionList} from '../../../../shared/misc/api/datatypes/abstract-selection-list.datatype';
import {ObjectListIdentifierPair} from '../../../../shared/misc/api/datatypes/object-list-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {PaginatorData} from '../../../../shared/ui/paginator/paginator-data.datastructure';
import {SortDirectionEnum} from '../../../../shared/ui/sorter/sort-direction.enum';
import {SorterData} from '../../../../shared/ui/sorter/sorter-data.datastructure';
import {AttachmentResource} from '../../api/attachments/resources/attachment.resource';
import {TaskEntity} from '../../entities/task/task.entity';
import {TaskScheduleEntity} from '../../entities/task-schedule/task-schedule.entity';
import {ATTACHMENT_SLICE_INITIAL_STATE} from '../attachments/attachment.initial-state';
import {PROJECT_MODULE_INITIAL_STATE} from '../project-module.initial-state';
import {TASK_SCHEDULE_SLICE_INITIAL_STATE} from '../task-schedules/task-schedule.initial-state';
import {ProjectTaskFilters} from './slice/project-task-filters';
import {ProjectTaskQueries} from './task-queries';

describe('Project Task Queries', () => {
    const testDataAttachments = new Array(2).fill(MOCK_ATTACHMENT_1);
    const testDataAttachmentsIds = new Array(2).fill(MOCK_ATTACHMENT_1.id);

    let projectTaskQueries: ProjectTaskQueries;
    let store: MockStore;

    const projectTaskSliceItems: TaskEntity[] = [MOCK_TASK_ENTITY, MOCK_TASK_ENTITY_WITHOUT_SCHEDULE];
    const testDataObjectIdentifier = new ObjectListIdentifierPair(ObjectTypeEnum.Task, MOCK_TASK_RESOURCE.id, true);
    const taskScheduleEntityFromTaskResource = TaskScheduleEntity.fromResource(MOCK_TASK_RESOURCE._embedded.schedule);
    const initialState: Pick<State, 'projectModule'> = {
        projectModule: {
            ...PROJECT_MODULE_INITIAL_STATE,
            attachmentSlice: {
                ...ATTACHMENT_SLICE_INITIAL_STATE,
                items: testDataAttachments,
                lists: {
                    ...ATTACHMENT_SLICE_INITIAL_STATE.lists,
                    [testDataObjectIdentifier.stringify()]: {
                        ids: testDataAttachmentsIds,
                        requestStatus: RequestStatusEnum.progress,
                    },
                },
            },
            taskScheduleSlice: {
                ...TASK_SCHEDULE_SLICE_INITIAL_STATE,
                items: [taskScheduleEntityFromTaskResource],
            },
            projectTaskSlice: {
                currentItem: {
                    id: MOCK_TASK_RESOURCE.id,
                    requestStatus: RequestStatusEnum.success,
                },
                items: projectTaskSliceItems,
                list: {
                    pages: [projectTaskSliceItems.map(item => item.id)],
                    filters: new ProjectTaskFilters(),
                    pagination: new PaginatorData(),
                    sort: new SorterData(),
                    requestStatus: RequestStatusEnum.success,
                    isFilterPanelOpen: false,
                    _links: {
                        create: {href: ''},
                        assign: {href: ''},
                        send: {href: ''},
                        self: {href: ''},
                    },
                },
                calendar: {
                    pages: [projectTaskSliceItems.map(item => item.id)],
                    filters: new ProjectTaskFilters(),
                    pagination: new PaginatorData(),
                    sort: new SorterData(),
                    requestStatus: RequestStatusEnum.success,
                    isFilterPanelOpen: false,
                    _links: {
                        create: {href: ''},
                        assign: {href: ''},
                        send: {href: ''},
                        self: {href: ''},
                    },
                },
                assignList: new AbstractSelectionList(),
                sendList: new AbstractSelectionList(),
            },
        },
    };

    const setStoreState = (newState: any): void => {
        store.setState(newState);
        store.refreshState();
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            ProjectTaskQueries,
            provideMockStore({initialState}),
            HttpClient,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        projectTaskQueries = TestBed.inject(ProjectTaskQueries);
        store = TestBed.inject(MockStore);
    });

    afterEach(() => {
        store.setState(initialState);
    });

    it('should check if task exists by id', () => {
        expect(projectTaskQueries.hasTaskById(MOCK_TASK_RESOURCE.id)).toBeTruthy();
    });

    it('should check if user has create task permission', () => {
        expect(projectTaskQueries.hasCreateTaskPermission()).toBeTruthy();
    });

    it('should observe assign task permission', () => {
        projectTaskQueries
            .observeAssignTaskPermission()
            .subscribe((result: boolean) =>
                expect(result).toBeTruthy());
    });

    it('should observe send task permission', () => {
        projectTaskQueries
            .observeSendTaskPermission()
            .subscribe((result: boolean) =>
                expect(result).toBeTruthy());
    });

    it('should observe current task', () => {
        projectTaskQueries
            .observeCurrentTask()
            .subscribe(result =>
                expect(result).toEqual(MOCK_TASK));
    });

    it('should observe current task id', () => {
        projectTaskQueries
            .observeCurrentTaskId()
            .subscribe((result: string) =>
                expect(result).toEqual(MOCK_TASK_RESOURCE.id));
    });

    it('should observe current task request status', () => {
        projectTaskQueries
            .observeCurrentTaskRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toEqual(RequestStatusEnum.success));
    });

    it('should observe that current task list page is initialized', () => {
        projectTaskQueries
            .observeCurrentTaskPageInitialized()
            .subscribe((result: boolean) =>
                expect(result).toBeTruthy());
    });

    it('should observe page of tasks', () => {
        projectTaskQueries
            .observeCurrentTaskPage()
            .subscribe(result =>
                expect(result).toEqual([MOCK_TASK, MOCK_TASK_WITHOUT_SCHEDULE]));
    });

    it('should observe tasks list sort', () => {
        const sorterData: SorterData = new SorterData('', SortDirectionEnum.asc);

        projectTaskQueries
            .observeTaskListSort()
            .subscribe((result: SorterData) =>
                expect(result).toEqual(sorterData));
    });

    it('should observe tasks list filter', () => {
        const filters: ProjectTaskFilters = new ProjectTaskFilters();

        projectTaskQueries
            .observeTaskListFilters()
            .subscribe((result: ProjectTaskFilters) =>
                expect(result).toEqual(filters));
    });

    it('should observe tasks list filters and not emit multiple values when ProjectTaskFilters.isEqual is true', () => {
        const results = [];
        const newState = cloneDeep(initialState);

        spyOn(ProjectTaskFilters, 'isEqual').and.returnValue(true);

        projectTaskQueries
            .observeTaskListFilters()
            .subscribe((result: ProjectTaskFilters) => results.push(result));

        newState.projectModule.projectTaskSlice.list.filters = new ProjectTaskFilters();
        setStoreState(newState);

        expect(results.length).toBe(1);
    });

    it('should observe tasks list filters and emit multiple values when ProjectTaskFilters.isEqual is false', () => {
        const results = [];
        const newState = cloneDeep(initialState);

        spyOn(ProjectTaskFilters, 'isEqual').and.returnValue(false);

        projectTaskQueries
            .observeTaskListFilters()
            .subscribe((result: ProjectTaskFilters) => results.push(result));

        newState.projectModule.projectTaskSlice.list.filters = new ProjectTaskFilters();
        setStoreState(newState);

        expect(results.length).toBe(2);
    });

    it('should observe filter panel visibility', () => {
        projectTaskQueries
            .observeTaskFilterPanelVisibility()
            .subscribe((result: boolean) =>
                expect(result).toBeFalsy());
    });

    it('should observe task list request status', () => {
        projectTaskQueries
            .observeTaskListRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toBe(RequestStatusEnum.success));
    });

    it('should observe calendar tasks and filter tasks without schedule', () => {
        projectTaskQueries
            .observeCalendarTasks()
            .subscribe(result =>
                expect(result).toEqual([MOCK_TASK]));
    });

    it('should observe calendar tasks filters', () => {
        const filters: ProjectTaskFilters = new ProjectTaskFilters();

        projectTaskQueries
            .observeCalendarFilters()
            .subscribe((result: ProjectTaskFilters) =>
                expect(result).toEqual(filters));
    });

    it('should observe calendar tasks filters and not emit multiple values when ProjectTaskFilters.isEqual is true', () => {
        const results = [];
        const newState = cloneDeep(initialState);

        spyOn(ProjectTaskFilters, 'isEqual').and.returnValue(true);

        projectTaskQueries
            .observeCalendarFilters()
            .subscribe((result: ProjectTaskFilters) => results.push(result));

        newState.projectModule.projectTaskSlice.calendar.filters = new ProjectTaskFilters();
        setStoreState(newState);

        expect(results.length).toBe(1);
    });

    it('should observe calendar tasks filters and emit multiple values when ProjectTaskFilters.isEqual is false', () => {
        const results = [];
        const newState = cloneDeep(initialState);

        spyOn(ProjectTaskFilters, 'isEqual').and.returnValue(false);

        projectTaskQueries
            .observeCalendarFilters()
            .subscribe((result: ProjectTaskFilters) => results.push(result));

        newState.projectModule.projectTaskSlice.calendar.filters = new ProjectTaskFilters();
        setStoreState(newState);

        expect(results.length).toBe(2);
    });

    it('should observe calendar filter panel visibility', () => {
        projectTaskQueries
            .observeTaskCalendarFilterPanelVisibility()
            .subscribe((result: boolean) =>
                expect(result).toBeFalsy());
    });

    it('should observe calendar tasks request status', () => {
        projectTaskQueries
            .observeCalendarRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toBe(RequestStatusEnum.success));
    });

    it('should observe task assign list', () => {
        const assignList: AbstractSelectionList = new AbstractSelectionList();

        projectTaskQueries
            .observeTaskAssignList()
            .subscribe((result: AbstractSelectionList) =>
                expect(result).toEqual(assignList));
    });

    it('should observe task assign list request status', () => {
        projectTaskQueries
            .observeTaskAssignListRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toBe(RequestStatusEnum.empty));
    });

    it('should observe task send list', () => {
        const sendList: AbstractSelectionList = new AbstractSelectionList();

        projectTaskQueries
            .observeTaskSendList()
            .subscribe((result: AbstractSelectionList) =>
                expect(result).toEqual(sendList));
    });

    it('should observe task send list request status', () => {
        projectTaskQueries
            .observeTaskSendListRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toBe(RequestStatusEnum.empty));
    });

    it('should observe current attachment list', () => {
        projectTaskQueries
            .observeCurrentTaskAttachments()
            .subscribe((result: AttachmentResource[]) =>
                expect(result).toEqual(testDataAttachments));
    });

    it('should observe current attachment list request status', () => {
        projectTaskQueries
            .observeCurrentTaskAttachmentsRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toEqual(RequestStatusEnum.progress));
    });

    it('should retrieve the current task name', () => {
        const taskName = ProjectTaskQueries.getTaskName() as any;

        store.pipe(
            select(taskName))
            .subscribe((result) => expect(result).toBe(MOCK_TASK_RESOURCE.name));
    });

    it('should retrieve null if current item id don\'t exist in store', () => {
        const newState = cloneDeep(initialState);
        const taskName = ProjectTaskQueries.getTaskName() as any;

        newState.projectModule.projectTaskSlice.currentItem.id = undefined;
        setStoreState(newState);

        store.pipe(
            select(taskName),
            take(1),
        ).subscribe((result) => expect(result).toBe(null));
    });

    it('should observe create task permission to be truthy driven from list links', () => {
        const newState = cloneDeep(initialState);

        newState.projectModule.projectTaskSlice.calendar._links = {self: {href: ''}};
        newState.projectModule.projectTaskSlice.list._links = {
            create: {href: ''},
            self: {href: ''},
        };
        setStoreState(newState);

        projectTaskQueries
            .observeCreateTaskPermission()
            .pipe(take(1))
            .subscribe((result: boolean) =>
                expect(result).toBeTruthy());
    });

    it('should observe create task permission to be truthy driven from calendar links', () => {
        const newState = cloneDeep(initialState);

        newState.projectModule.projectTaskSlice.list._links = {self: {href: ''}};
        newState.projectModule.projectTaskSlice.calendar._links = {
            create: {href: ''},
            self: {href: ''},
        };
        setStoreState(newState);

        projectTaskQueries
            .observeCreateTaskPermission()
            .pipe(take(1))
            .subscribe((result: boolean) =>
                expect(result).toBeTruthy());
    });

    it('should observe create task permission to be falsy ', () => {
        const newState = cloneDeep(initialState);

        newState.projectModule.projectTaskSlice.list._links = {self: {href: ''}};
        newState.projectModule.projectTaskSlice.calendar._links = {self: {href: ''}};
        setStoreState(newState);

        projectTaskQueries
            .observeCreateTaskPermission()
            .pipe(take(1))
            .subscribe((result: boolean) =>
                expect(result).toBeFalsy());
    });

    it('should observe if filters are applied to task list when there are no filters applied', () => {
        const newState = cloneDeep(initialState);

        newState.projectModule.projectTaskSlice.list.filters = new ProjectTaskFilters();
        setStoreState(newState);

        projectTaskQueries
            .hasTaskListFiltersApplied()
            .pipe(take(1))
            .subscribe((result: boolean) =>
                expect(result).toBeFalsy());
    });

    it('should observe if filters are applied to task list when there are filters applied', () => {
        const newState = cloneDeep(initialState);
        const filter = new ProjectTaskFilters();

        filter.criteria.projectCraftIds = ['foo'];
        newState.projectModule.projectTaskSlice.list.filters = filter;
        setStoreState(newState);

        projectTaskQueries
            .hasTaskListFiltersApplied()
            .pipe(take(1))
            .subscribe((result: boolean) =>
                expect(result).toBeTruthy());
    });

    it('should observe if filters are applied to task list when useCriteria is FALSE', () => {
        const newState = cloneDeep(initialState);
        const filter = new ProjectTaskFilters();

        filter.useCriteria = false;
        newState.projectModule.projectTaskSlice.list.filters = filter;
        setStoreState(newState);

        projectTaskQueries
            .hasTaskListFiltersApplied()
            .pipe(take(1))
            .subscribe((result: boolean) =>
                expect(result).toBeTruthy());
    });

    it('should observe if filters are applied to calendar when there are no filters applied', () => {
        const newState = cloneDeep(initialState);

        newState.projectModule.projectTaskSlice.calendar.filters = new ProjectTaskFilters();
        setStoreState(newState);

        projectTaskQueries
            .hasCalendarFiltersApplied()
            .pipe(take(1))
            .subscribe((result: boolean) =>
                expect(result).toBeFalsy());
    });

    it('should observe if filters are applied to calendar when there are filters applied', () => {
        const newState = cloneDeep(initialState);
        const filter = new ProjectTaskFilters();

        filter.criteria.projectCraftIds = ['foo'];
        newState.projectModule.projectTaskSlice.calendar.filters = filter;
        setStoreState(newState);

        projectTaskQueries
            .hasCalendarFiltersApplied()
            .pipe(take(1))
            .subscribe((result: boolean) =>
                expect(result).toBeTruthy());
    });

    it('should observe if filters are applied to calendar when useCriteria is FALSE', () => {
        const newState = cloneDeep(initialState);
        const filter = new ProjectTaskFilters();

        filter.useCriteria = false;
        newState.projectModule.projectTaskSlice.calendar.filters = filter;
        setStoreState(newState);

        projectTaskQueries
            .hasCalendarFiltersApplied()
            .pipe(take(1))
            .subscribe((result: boolean) =>
                expect(result).toBeTruthy());
    });

    it('should observe tasks by id', () => {
        projectTaskQueries.observeTasksById([MOCK_TASK_RESOURCE.id])
            .subscribe(result => expect(result).toEqual([MOCK_TASK]));
    });
});
