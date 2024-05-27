/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
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
    MOCK_SAVE_TASK_SCHEDULE_A,
    MOCK_TASK_SCHEDULE_A,
    MOCK_TASK_SCHEDULE_B,
    MOCK_TASK_SCHEDULE_RESOURCE_A,
    MOCK_TASK_SCHEDULE_RESOURCE_B
} from '../../../../../test/mocks/task-schedules';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {TaskScheduleResource} from '../tasks/resources/task-schedule.resource';
import {CreateTaskScheduleListItemResource} from './resources/create-task-schedule-list-item.resource';
import {SaveTaskScheduleListItemResource} from './resources/save-task-schedule-list-item.resource';
import {TaskScheduleService} from './task-schedule.service';

describe('Task Schedule Service', () => {
    let taskScheduleService: TaskScheduleService;
    let httpMock: HttpTestingController;
    let request: TestRequest;

    const projectId = 'foo';
    const taskId = '456';
    const taskIds = ['123', '456'];
    const taskScheduleIds = ['abc', 'def'];
    const scheduleId = 'bar';
    const schedule = MOCK_SAVE_TASK_SCHEDULE_A;
    const version = 0;

    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const url = `${baseUrl}/projects/${projectId}/tasks/schedules/${scheduleId}`;
    const urlByTask = `${baseUrl}/projects/tasks/${taskId}/schedule`;
    const bulkUrlByTask = `${baseUrl}/projects/tasks/schedules?identifierType=${ObjectTypeEnum.Task}`;
    const bulkUrlByTaskSchedule = `${baseUrl}/projects/tasks/schedules?identifierType=${ObjectTypeEnum.TaskSchedule}`;
    const batchUrl = `${baseUrl}/projects/tasks/schedules/batch`;
    const taskScheduleList = [MOCK_TASK_SCHEDULE_A, MOCK_TASK_SCHEDULE_B];
    const taskScheduleResourceList = [MOCK_TASK_SCHEDULE_RESOURCE_A, MOCK_TASK_SCHEDULE_RESOURCE_B];
    const batchTaskScheduleListResponse = {taskSchedules: taskScheduleResourceList};
    const taskScheduleCreateList: CreateTaskScheduleListItemResource[] =
        taskScheduleList.map(taskSchedule =>
            new CreateTaskScheduleListItemResource(taskSchedule.task.id, taskSchedule.start.toString(), taskSchedule.end.toString()));
    const taskScheduleSaveList: SaveTaskScheduleListItemResource[] =
        taskScheduleList.map(({id, version:listVersion, start, end}) =>
            new SaveTaskScheduleListItemResource(id, listVersion, start.toString(), end.toString()));

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        taskScheduleService = TestBed.inject(TaskScheduleService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call findOne and return task schedule', waitForAsync(() => {
        taskScheduleService
            .findOne(projectId, scheduleId)
            .subscribe((response: TaskScheduleResource) =>
                expect(response).toBe(MOCK_TASK_SCHEDULE_RESOURCE_A));

        request = httpMock.expectOne(url);
        request.flush(MOCK_TASK_SCHEDULE_RESOURCE_A);
    }));

    it('should call findOneByTaskId and return task schedule', waitForAsync(() => {
        taskScheduleService
            .findOneByTaskId(taskId)
            .subscribe((response: TaskScheduleResource) =>
                expect(response).toBe(MOCK_TASK_SCHEDULE_RESOURCE_A));

        request = httpMock.expectOne(urlByTask);
        request.flush(MOCK_TASK_SCHEDULE_RESOURCE_A);
    }));

    it('should call findAllByIds and return task schedules', waitForAsync(() => {
        taskScheduleService
            .findAllByIds(taskScheduleIds)
            .subscribe((response: TaskScheduleResource[]) =>
                expect(response).toEqual([MOCK_TASK_SCHEDULE_RESOURCE_A, MOCK_TASK_SCHEDULE_RESOURCE_A]));

        request = httpMock.expectOne(bulkUrlByTaskSchedule);
        expect(request.request.method).toBe('POST');
        request.flush({
            taskSchedules: [MOCK_TASK_SCHEDULE_RESOURCE_A, MOCK_TASK_SCHEDULE_RESOURCE_A],
        });
    }));

    it('should call findAllFromTasks and return task schedules', waitForAsync(() => {
        taskScheduleService
            .findAllFromTasks(taskIds)
            .subscribe((response: TaskScheduleResource[]) =>
                expect(response).toEqual([MOCK_TASK_SCHEDULE_RESOURCE_A, MOCK_TASK_SCHEDULE_RESOURCE_A]));

        request = httpMock.expectOne(bulkUrlByTask);
        expect(request.request.method).toBe('POST');
        request.flush({
            taskSchedules: [MOCK_TASK_SCHEDULE_RESOURCE_A, MOCK_TASK_SCHEDULE_RESOURCE_A],
        });
    }));

    it('should call create and return task schedule', waitForAsync(() => {
        taskScheduleService
            .create(taskId, schedule)
            .subscribe((response: TaskScheduleResource) =>
                expect(response).toBe(MOCK_TASK_SCHEDULE_RESOURCE_A));

        request = httpMock.expectOne(urlByTask);
        request.flush(MOCK_TASK_SCHEDULE_RESOURCE_A);
    }));

    it('should call update and return task schedule', waitForAsync(() => {
        taskScheduleService
            .update(taskId, schedule, version)
            .subscribe((response: TaskScheduleResource) =>
                expect(response).toBe(MOCK_TASK_SCHEDULE_RESOURCE_A));

        request = httpMock.expectOne(urlByTask);
        request.flush(MOCK_TASK_SCHEDULE_RESOURCE_A);
    }));

    it('should call createAll and return list of task schedules', waitForAsync(() => {
        taskScheduleService
            .createAll(taskScheduleCreateList)
            .subscribe((response: TaskScheduleResource[]) =>
                expect(response).toBe(taskScheduleResourceList));

        request = httpMock.expectOne(batchUrl);
        request.flush(batchTaskScheduleListResponse);
    }));

    it('should call updateAll and return list of task schedules', waitForAsync(() => {
        taskScheduleService
            .updateAll(taskScheduleSaveList)
            .subscribe((response: TaskScheduleResource[]) =>
                expect(response).toBe(taskScheduleResourceList));

        request = httpMock.expectOne(batchUrl);
        request.flush(batchTaskScheduleListResponse);
    }));
});
