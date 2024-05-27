/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    HttpClientTestingModule,
    HttpTestingController,
    TestRequest
} from '@angular/common/http/testing';
import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {configuration} from '../../../../../configurations/configuration.local-with-dev-backend';
import {
    MOCK_CREATE_TASK,
    MOCK_TASK_1,
    MOCK_TASK_2,
    MOCK_TASK_LIST,
    MOCK_TASK_LIST_SERVICE,
} from '../../../../../test/mocks/tasks';
import {MOCK_WORKAREA_A} from '../../../../../test/mocks/workareas';
import {AbstractIdsSaveResource} from '../../../../shared/misc/api/resources/abstract-ids-save.resource';
import {AbstractItemsResource} from '../../../../shared/misc/api/resources/abstract-items.resource';
import {Task} from '../../models/tasks/task';
import {ProjectTaskFilters} from '../../store/tasks/slice/project-task-filters';
import {SaveProjectTaskFilters} from '../../store/tasks/slice/save-project-task-filters';
import {CreateTaskListItemResource} from './resources/create-task-list-item.resource';
import {SaveCopyTaskResource} from './resources/save-copy-task.resource';
import {SaveTaskListItemResource} from './resources/save-task-list-item.resource';
import {TaskResource} from './resources/task.resource';
import {ProjectTaskListResource} from './resources/task-list.resource';
import {
    TASKS_SORT_FIELDS,
    TaskService
} from './task.service';

describe('Task Service', () => {
    let tasksService: TaskService;
    let httpMock: HttpTestingController;
    let request: TestRequest;

    const testDataProjectId = '123';
    const testDataTaskId = '456';
    const testDataParticipantId = '012';
    const testDataColumn = 'company';
    const testDataOrder = 'asc';
    const testDataPageNumber = 1;
    const testDataPageSize = 10;
    const projectTaskFilters = new ProjectTaskFilters();
    const testDataFilters: SaveProjectTaskFilters = SaveProjectTaskFilters.fromProjectTaskFilters(projectTaskFilters);

    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const copyAllUrl = `${baseUrl}/projects/${testDataProjectId}/tasks/copy`;
    const createUrl = `${baseUrl}/projects/tasks`;
    const assignUrl = `${baseUrl}/projects/tasks/assign`;
    const sendAllUrl = `${baseUrl}/projects/${testDataProjectId}/tasks/send`;
    const updateUrl = `${baseUrl}/projects/tasks/${MOCK_TASK_1.id}`;
    const deleteUrl = `${baseUrl}/projects/tasks/${MOCK_TASK_1.id}`;
    const deleteAllUrl = `${baseUrl}/projects/${testDataProjectId}/tasks/delete`;
    const sendUrl = `${baseUrl}/projects/tasks/${MOCK_TASK_1.id}/send`;
    const startUrl = `${baseUrl}/projects/tasks/${MOCK_TASK_1.id}/start`;
    const startAllUrl = `${baseUrl}/projects/${testDataProjectId}/tasks/start`;
    const closeUrl = `${baseUrl}/projects/tasks/${MOCK_TASK_1.id}/close`;
    const closeAllUrl = `${baseUrl}/projects/${testDataProjectId}/tasks/close`;
    const acceptUrl = `${baseUrl}/projects/tasks/${MOCK_TASK_1.id}/accept`;
    const acceptAllUrl = `${baseUrl}/projects/${testDataProjectId}/tasks/accept`;
    const resetUrl = `${baseUrl}/projects/tasks/${MOCK_TASK_1.id}/reset`;
    const resetAllUrl = `${baseUrl}/projects/${testDataProjectId}/tasks/reset`;
    const batchUrl = `${baseUrl}/projects/tasks/batch`;
    const batchFindUrl = `${baseUrl}/projects/${testDataProjectId}/tasks/batch/find`;
    const version = 1;

    const testDataTaskList: ProjectTaskListResource = MOCK_TASK_LIST_SERVICE;
    const testDataAbstractTaskList: AbstractItemsResource<TaskResource> = {
        items: testDataTaskList.tasks,
        _links: testDataTaskList._links,
    };
    const testDataTask: TaskResource = MOCK_TASK_1;
    const taskList: Task[] = [MOCK_TASK_2];
    const taskResourceList: TaskResource[] = testDataTaskList.tasks;
    const taskCreateList: CreateTaskListItemResource[] = taskList.map(task =>
        new CreateTaskListItemResource(task.project.id, task.name, task.description, task.status, task.location,
            task.projectCraft.id, task.workArea.id, task.schedule.start, task.schedule.end, task.assignee.id, null));
    const taskUpdateList: SaveTaskListItemResource[] = taskList.map(task =>
        new SaveTaskListItemResource(task.id, task.version, task.project.id, task.name, task.description, task.status, task.location,
            task.projectCraft.id, task.workArea.id, task.schedule.start, task.schedule.end, task.assignee.id, null));

    const mockAbstractTaskList: AbstractItemsResource<TaskResource> = {
        items: MOCK_TASK_LIST.tasks,
        _links: MOCK_TASK_LIST._links,
    };

    const findAllUrl = (column: string) => {
        const parsedColumn: string = column ? TASKS_SORT_FIELDS[column] : '';
        return `${baseUrl}/projects/${testDataProjectId}/tasks/` +
            `search?page=${testDataPageNumber}&size=${testDataPageSize}&sort=${parsedColumn},${testDataOrder}`;
    };

    const findOneUrl = (taskId: string) => `${baseUrl}/projects/tasks/${taskId}`;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
        providers: [TaskService],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        tasksService = TestBed.inject(TaskService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call findOne and return a task', waitForAsync(() => {
        tasksService.findOne(testDataTaskId)
            .subscribe((response: TaskResource) =>
                expect(response).toEqual(testDataTask));

        request = httpMock.expectOne(findOneUrl(testDataTaskId));
        request.flush(testDataTask);
    }));

    it('should call get tasks and return a task list', waitForAsync(() => {
        tasksService.findAll(testDataProjectId, testDataColumn, testDataOrder, testDataPageNumber, testDataPageSize, testDataFilters)
            .subscribe((response: ProjectTaskListResource) =>
                expect(response).toEqual(testDataTaskList));

        request = httpMock.expectOne(findAllUrl(testDataColumn));
        expect(request.request.body).toEqual(testDataFilters);
        request.flush(testDataTaskList);
    }));

    it('should call assign tasks and return a task list', waitForAsync(() => {
        tasksService.assign([testDataTaskId], testDataParticipantId)
            .subscribe((response: ProjectTaskListResource) =>
                expect(response).toEqual(testDataTaskList));

        request = httpMock.expectOne(assignUrl);
        request.flush(testDataTaskList);
    }));

    it('should call send task and return a task', waitForAsync(() => {
        const task = MOCK_TASK_1;
        const taskId = task.id;

        tasksService.send(taskId)
            .subscribe((response: TaskResource) =>
                expect(response).toEqual(task));

        request = httpMock.expectOne(sendUrl);
        request.flush(task);
    }));

    it('should call sendAll tasks and return a task list', waitForAsync(() => {
        const ids: AbstractIdsSaveResource = new AbstractIdsSaveResource([MOCK_TASK_1.id, MOCK_TASK_2.id]);

        tasksService.sendAll(ids, testDataProjectId)
            .subscribe((response: AbstractItemsResource<TaskResource>) =>
                expect(response).toEqual(mockAbstractTaskList));

        request = httpMock.expectOne(sendAllUrl);
        request.flush(mockAbstractTaskList);
    }));

    it('should call create task and return a task', waitForAsync(() => {
        tasksService.create(MOCK_CREATE_TASK)
            .subscribe((response: TaskResource) =>
                expect(response).toEqual(MOCK_TASK_1));

        request = httpMock.expectOne(createUrl);
        request.flush(MOCK_TASK_1);
    }));

    it('should call delete task and return nothing', waitForAsync(() => {
        tasksService.delete(MOCK_TASK_1.id, version)
            .subscribe((response: void) =>
                expect(response).toBe(null));

        request = httpMock.expectOne(deleteUrl);
        request.flush(null);
    }));

    it('should call update task and return task', waitForAsync(() => {
        tasksService.update(MOCK_TASK_1.id, MOCK_CREATE_TASK, version)
            .subscribe((response: TaskResource) =>
                expect(response).toEqual(MOCK_TASK_1));

        request = httpMock.expectOne(updateUrl);
        request.flush(MOCK_TASK_1);
    }));

    it('should call start task and return a task', waitForAsync(() => {
        const task = MOCK_TASK_1;
        const taskId = task.id;

        tasksService.start(taskId)
            .subscribe((response: TaskResource) =>
                expect(response).toEqual(task));

        request = httpMock.expectOne(startUrl);
        request.flush(task);
    }));

    it('should call close task and return a task', waitForAsync(() => {
        const task = MOCK_TASK_1;
        const taskId = task.id;

        tasksService.close(taskId)
            .subscribe((response: TaskResource) =>
                expect(response).toEqual(task));

        request = httpMock.expectOne(closeUrl);
        request.flush(task);
    }));

    it('should call accept task and return a task', waitForAsync(() => {
        const task = MOCK_TASK_1;
        const taskId = task.id;

        tasksService.accept(taskId)
            .subscribe((response: TaskResource) =>
                expect(response).toEqual(task));

        request = httpMock.expectOne(acceptUrl);
        request.flush(task);
    }));

    it('should call reset task and return a task', waitForAsync(() => {
        const task = MOCK_TASK_1;
        const taskId = task.id;

        tasksService.reset(taskId)
            .subscribe((response: TaskResource) =>
                expect(response).toEqual(task));

        request = httpMock.expectOne(resetUrl);
        request.flush(task);
    }));

    it('should call createAll and return list of tasks', waitForAsync(() => {
        tasksService
            .createAll(taskCreateList)
            .subscribe((response: TaskResource[]) =>
                expect(response).toBe(taskResourceList));

        request = httpMock.expectOne(batchUrl);
        request.flush(testDataTaskList);
    }));

    it('should call updateAll and return list of tasks', waitForAsync(() => {
        tasksService
            .updateAll(taskUpdateList)
            .subscribe((response: TaskResource[]) =>
                expect(response).toBe(taskResourceList));

        request = httpMock.expectOne(batchUrl);
        request.flush(testDataTaskList);
    }));

    it('should call findAllByIds and return list of tasks', waitForAsync(() => {
        const ids = testDataAbstractTaskList.items.map(item => item.id);

        tasksService
            .findAllByIds(testDataProjectId, ids)
            .subscribe((response: TaskResource[]) =>
                expect(response).toBe(taskResourceList));

        request = httpMock.expectOne(batchFindUrl);
        request.flush(testDataAbstractTaskList);
    }));

    it('should call deleteAll and return a success response', waitForAsync(() => {
        const ids: AbstractIdsSaveResource = new AbstractIdsSaveResource([MOCK_TASK_1.id, MOCK_TASK_2.id]);

        tasksService.deleteAll(ids, testDataProjectId)
            .subscribe((response: void) =>
                expect(response).toBe(null));

        request = httpMock.expectOne(deleteAllUrl);
        request.flush(null);
    }));

    it('should call closeAll and return a success response', waitForAsync(() => {
        const ids: AbstractIdsSaveResource = new AbstractIdsSaveResource([MOCK_TASK_1.id, MOCK_TASK_2.id]);

        tasksService.closeAll(ids, testDataProjectId)
            .subscribe((response: AbstractItemsResource<TaskResource>) =>
                expect(response).toEqual(mockAbstractTaskList));

        request = httpMock.expectOne(closeAllUrl);
        request.flush(mockAbstractTaskList);
    }));

    it('should call startAll and return a success response', waitForAsync(() => {
        const ids: AbstractIdsSaveResource = new AbstractIdsSaveResource([MOCK_TASK_1.id, MOCK_TASK_2.id]);

        tasksService.startAll(ids, testDataProjectId)
            .subscribe((response: AbstractItemsResource<TaskResource>) =>
                expect(response).toEqual(mockAbstractTaskList));

        request = httpMock.expectOne(startAllUrl);
        request.flush(mockAbstractTaskList);
    }));

    it('should call acceptAll and return a success response', waitForAsync(() => {
        const ids: AbstractIdsSaveResource = new AbstractIdsSaveResource([MOCK_TASK_1.id, MOCK_TASK_2.id]);

        tasksService.acceptAll(ids, testDataProjectId)
            .subscribe((response: AbstractItemsResource<TaskResource>) =>
                expect(response).toEqual(mockAbstractTaskList));

        request = httpMock.expectOne(acceptAllUrl);
        request.flush(mockAbstractTaskList);
    }));

    it('should call resetAll and return a success response', waitForAsync(() => {
        const ids: AbstractIdsSaveResource = new AbstractIdsSaveResource([MOCK_TASK_1.id, MOCK_TASK_2.id]);

        tasksService.resetAll(ids, testDataProjectId)
            .subscribe((response: AbstractItemsResource<TaskResource>) =>
                expect(response).toEqual(mockAbstractTaskList));

        request = httpMock.expectOne(resetAllUrl);
        request.flush(mockAbstractTaskList);
    }));

    it('should call copyAll and return a success response', waitForAsync(() => {
        const items: SaveCopyTaskResource[] = [
            {
                id: MOCK_TASK_1.id,
                shiftDays: 5,
                includeDayCards: true,
                parametersOverride: {
                    workAreaId: MOCK_WORKAREA_A.id,
                },
            },
            {
                id: MOCK_TASK_2.id,
                shiftDays: 5,
                includeDayCards: true,
                parametersOverride: {
                    workAreaId: MOCK_WORKAREA_A.id,
                },
            },
        ]

        tasksService.copyAll(items, testDataProjectId)
            .subscribe((response: AbstractItemsResource<TaskResource>) =>
                expect(response).toEqual(mockAbstractTaskList));

        request = httpMock.expectOne(copyAllUrl);
        request.flush(mockAbstractTaskList);
    }));
});
