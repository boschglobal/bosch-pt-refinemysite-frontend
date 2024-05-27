/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {MOCK_TASK} from '../../../../../test/mocks/tasks';
import {ResourceLink} from '../../../../shared/misc/api/datatypes/resource-link.datatype';
import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../../../../shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {AttachmentListResource} from '../../api/attachments/resources/attachment-list.resource';
import {ProjectCraftResource} from '../../api/crafts/resources/project-craft.resource';
import {TaskConstraintsResource} from '../../api/task-constraints/resources/task-constraints.resource';
import {
    TaskResource,
    TaskStatistics
} from '../../api/tasks/resources/task.resource';
import {TaskScheduleResource} from '../../api/tasks/resources/task-schedule.resource';
import {
    TaskEntity,
    TaskEntityProjectCraft
} from '../../entities/task/task.entity';
import {TaskStatusEnum} from '../../enums/task-status.enum';
import {TaskSchedule} from '../task-schedules/task-schedule';
import {Task} from './task';

describe('Task', () => {

    function fillTask<T>(index: number, date: Date, target: any): T {
        target.id = `id ${index}`;
        target.version = index;
        target.createdBy = new ResourceReference(`created by id ${index}`, `created by name ${index}`);
        target.createdDate = date;
        target.lastModifiedBy = new ResourceReference(`modified by id ${index}`, `modified by name ${index}`);
        target.lastModifiedDate = date;
        target.project = new ResourceReference(`project id ${index}`, `project name ${index}`);
        target.name = `name ${index}`;
        target.description = `description ${index}`;
        target.creator = new ResourceReference(`creator id ${index}`, `creator name ${index}`);
        target.company = new ResourceReference(`company id ${index}`, `company name ${index}`);
        target.location = `location ${index}`;
        target.workArea = new ResourceReference(`workArea id ${index}`, `workArea name ${index}`);
        target.assignee = new ResourceReferenceWithPicture(`assignee id ${index}`, `assignee name ${index}`, `assignee picture ${index}`);
        target.status = TaskStatusEnum.OPEN;
        target.issue = true;
        target.assigned = true;
        target.editDate = date;

        return target;
    }

    function createTaskResource(index: number, hasLinks: boolean, date: Date): TaskResource {
        const taskResource = fillTask<TaskResource>(index, date, new TaskResource());

        taskResource.projectCraft = new ProjectCraftResource();
        taskResource._links = {};

        taskResource._embedded = {
            statistics: new TaskStatistics(),
            attachments: new AttachmentListResource(),
            schedule: new TaskScheduleResource(),
            constraints: new TaskConstraintsResource(),
        };

        if (hasLinks) {
            taskResource._links.update = createLink();
            taskResource._links.assign = createLink();
            taskResource._links.unassign = createLink();
            taskResource._links.send = createLink();
            taskResource._links.delete = createLink();
            taskResource._links.reset = createLink();
            taskResource._links.start = createLink();
            taskResource._links.accept = createLink();
            taskResource._links.close = createLink();
            taskResource._links.updateConstraints = createLink();
        }

        return taskResource;
    }

    function createLink(): ResourceLink {
        const link = new ResourceLink();
        link.href = '';

        return link;
    }

    function createTask(index: number, hasPermissions: boolean, date: Date, schedule: TaskSchedule): Task {
        const task = fillTask<Task>(index, date, {});

        task.statistics = new TaskStatistics();
        task.attachments = new AttachmentListResource();
        task.schedule = schedule;
        task.constraints = new TaskConstraintsResource();
        task.projectCraft = {} as TaskEntityProjectCraft;

        task.permissions = {
            canUpdate: hasPermissions,
            canAssign: hasPermissions,
            canUnassign: hasPermissions,
            canSend: hasPermissions,
            canDelete: hasPermissions,
            canReset: hasPermissions,
            canStart: hasPermissions,
            canClose: hasPermissions,
            canAccept: hasPermissions,
            canUpdateConstraints: hasPermissions,
        };

        return task;
    }

    function createTaskWithTaskAndScheduleVersion(taskId: string, taskVersion: number, scheduleId: string, scheduleVersion: number): Task {
        return {
            ...MOCK_TASK,
            id: taskId,
            version: taskVersion,
            schedule: {
                ...MOCK_TASK.schedule,
                id: scheduleId,
                version: scheduleVersion,
            },
        }
    }

    it('should return null if the task entity is null', () => {
        expect(Task.fromTaskEntity(null, null)).toBe(null);
    });

    it('should return undefined if the task entity is undefined', () => {
        expect(Task.fromTaskEntity(undefined, null)).toBe(undefined);
    });

    it('should return a task entity with permissions', () => {
        const date = new Date('1989-02-14');
        const schedule = new TaskSchedule();
        const taskResource = createTaskResource(1, true, date);
        const taskEntity = TaskEntity.fromResource(taskResource);
        const expectedTask = createTask(1, true, date, schedule);

        expect(Task.fromTaskEntity(taskEntity, schedule)).toEqual(expectedTask);
    });

    it('should return a task entity without permissions', () => {
        const date = new Date('1989-02-14');
        const schedule = new TaskSchedule();
        const taskResource = createTaskResource(1, false, date);
        const taskEntity = TaskEntity.fromResource(taskResource);
        const expectedTask = createTask(1, false, date, schedule);

        expect(Task.fromTaskEntity(taskEntity, schedule)).toEqual(expectedTask);
    });

    it('should return true when isEqual is called for two tasks with the same id, version, schedule id and schedule version', () => {
        const taskA: Task = createTaskWithTaskAndScheduleVersion('1', 1, '2', 2);
        const taskB: Task = createTaskWithTaskAndScheduleVersion('1', 1, '2', 2);

        expect(Task.isEqual(taskA, taskB)).toBeTruthy();
    });

    it('should return true when isEqual is called for two tasks with the same task id and schedule id and ' +
        'no task or schedule version', () => {
        const taskA: Task = createTaskWithTaskAndScheduleVersion('1', undefined, '2', undefined);
        const taskB: Task = createTaskWithTaskAndScheduleVersion('1', undefined, '2', undefined);

        expect(Task.isEqual(taskA, taskB)).toBeTruthy();
    });

    it('should return false when isEqual is called for two tasks with different versions', () => {
        const taskA: Task = createTaskWithTaskAndScheduleVersion('1', 1, '2', 2);
        const taskB: Task = createTaskWithTaskAndScheduleVersion('1', 2, '2', 2);

        expect(Task.isEqual(taskA, taskB)).toBeFalsy();
    });

    it('should return false when isEqual is called for two tasks with different ids', () => {
        const taskA: Task = createTaskWithTaskAndScheduleVersion('1', 1, '2', 2);
        const taskB: Task = createTaskWithTaskAndScheduleVersion('2', 1, '2', 2);

        expect(Task.isEqual(taskA, taskB)).toBeFalsy();
    });

    it('should return false when isEqual is called for two tasks with different schedule versions', () => {
        const taskA: Task = createTaskWithTaskAndScheduleVersion('1', 1, '2', 1);
        const taskB: Task = createTaskWithTaskAndScheduleVersion('1', 1, '2', 2);

        expect(Task.isEqual(taskA, taskB)).toBeFalsy();
    });

    it('should return true when isEqualArray is called for two empty arrays of tasks', () => {
        const taskArrayA: Task[] = [];
        const taskArrayB: Task[] = [];

        expect(Task.isEqualArray(taskArrayA, taskArrayB)).toBeTruthy();
    });

    it('should return true when isEqualArray is called for two arrays of tasks with equal tasks, in the same order', () => {
        const taskA: Task = createTaskWithTaskAndScheduleVersion('1', 1, '2', 2);
        const taskB: Task = createTaskWithTaskAndScheduleVersion('2', 1, '2', 2);
        const taskArrayA: Task[] = [
            taskA,
            taskB,
        ];
        const taskArrayB: Task[] = [
            taskA,
            taskB,
        ];

        expect(Task.isEqualArray(taskArrayA, taskArrayB)).toBeTruthy();
    });

    it('should return true when isEqualArray is called for two arrays of tasks with equal tasks, in different order', () => {
        const taskA: Task = createTaskWithTaskAndScheduleVersion('1', 1, '2', 2);
        const taskB: Task = createTaskWithTaskAndScheduleVersion('2', 1, '2', 2);
        const taskArrayA: Task[] = [
            taskA,
            taskB,
        ];
        const taskArrayB: Task[] = [
            taskB,
            taskA,
        ];

        expect(Task.isEqualArray(taskArrayA, taskArrayB)).toBeTruthy();
    });

    it('should return false when isEqualArray is called for two arrays of tasks with different sizes', () => {
        const taskA: Task = createTaskWithTaskAndScheduleVersion('1', 1, '2', 2);
        const taskB: Task = createTaskWithTaskAndScheduleVersion('2', 1, '2', 2);
        const taskArrayA: Task[] = [
            taskA,
            taskB,
        ];
        const taskArrayB: Task[] = [
            taskB,
        ];

        expect(Task.isEqualArray(taskArrayA, taskArrayB)).toBeFalsy();
    });

    it('should return false when isEqualArray is called for two arrays of tasks with the same size, but different tasks', () => {
        const taskA: Task = createTaskWithTaskAndScheduleVersion('1', 1, '2', 2);
        const taskB: Task = createTaskWithTaskAndScheduleVersion('2', 1, '2', 2);
        const taskArrayA: Task[] = [
            taskA,
        ];
        const taskArrayB: Task[] = [
            taskB,
        ];

        expect(Task.isEqualArray(taskArrayA, taskArrayB)).toBeFalsy();
    });
});
