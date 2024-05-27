/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../shared/misc/api/datatypes/resource-link.datatype';
import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {TaskScheduleResource} from '../../api/tasks/resources/task-schedule.resource';
import {TaskScheduleEntity} from '../../entities/task-schedule/task-schedule.entity';
import {TaskSchedule} from './task-schedule';

describe('Task Schedule', () => {

    function fillTask<T>(index: number, date: Date, target: any): T {
        target.id = `id ${index}`;
        target.version = index;
        target.createdBy = new ResourceReference(`created by id ${index}`, `created by name ${index}`);
        target.createdDate = date;
        target.lastModifiedBy = new ResourceReference(`modified by id ${index}`, `modified by name ${index}`);
        target.lastModifiedDate = date;
        target.start = date;
        target.end = date;
        target.task = new ResourceReference(`task id ${index}`, `task name ${index}`);
        target.slots = [];

        return target;
    }

    function createTaskScheduleResource(index: number, hasLinks: boolean, date: Date): TaskScheduleResource {
        const taskScheduleResource = fillTask<TaskScheduleResource>(index, date, new TaskScheduleResource());

        taskScheduleResource._links = {
            self: createLink(),
        };

        if (hasLinks) {
            taskScheduleResource._links.update = createLink();
            taskScheduleResource._links.add = createLink();
        }

        return taskScheduleResource;
    }

    function createLink(): ResourceLink {
        const link = new ResourceLink();
        link.href = '';

        return link;
    }

    function createTaskSchedule(index: number, hasPermissions: boolean, date: Date): TaskSchedule {
        const taskSchedule = fillTask<TaskSchedule>(index, date, new TaskSchedule());

        taskSchedule.permissions = {
            canUpdate: hasPermissions,
            canAdd: hasPermissions,
        };

        return taskSchedule;
    }

    it('should return null if the task schedule entity is null', () => {
        expect(TaskSchedule.fromTaskScheduleEntity(null)).toBe(null);
    });

    it('should return undefined if the task schedule entity is undefined', () => {
        expect(TaskSchedule.fromTaskScheduleEntity(undefined)).toBe(undefined);
    });

    it('should return a task schedule with permissions', () => {
        const date = new Date('1989-02-14');
        const taskScheduleResource = createTaskScheduleResource(1, true, date);
        const taskScheduleEntity = TaskScheduleEntity.fromResource(taskScheduleResource);
        const expectedTaskSchedule = createTaskSchedule(1, true, date);

        expect(TaskSchedule.fromTaskScheduleEntity(taskScheduleEntity)).toEqual(expectedTaskSchedule);
    });

    it('should return a task schedule without permissions', () => {
        const date = new Date('1989-02-14');
        const taskScheduleResource = createTaskScheduleResource(1, false, date);
        const taskScheduleEntity = TaskScheduleEntity.fromResource(taskScheduleResource);
        const expectedTaskSchedule = createTaskSchedule(1, false, date);

        expect(TaskSchedule.fromTaskScheduleEntity(taskScheduleEntity)).toEqual(expectedTaskSchedule);
    });
});
