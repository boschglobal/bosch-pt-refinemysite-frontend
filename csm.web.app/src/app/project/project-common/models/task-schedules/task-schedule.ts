/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {AbstractAuditableResource} from '../../../../shared/misc/api/resources/abstract-auditable.resource';
import {TaskScheduleSlotResource} from '../../api/tasks/resources/task-schedule.resource';
import {TaskScheduleEntity} from '../../entities/task-schedule/task-schedule.entity';
import {TaskScheduleEntityPermissionEnum} from '../../enums/task-schedule-entity-permission.enum';

export interface TaskSchedulePermissions {
    canUpdate: boolean;
    canAdd: boolean;
}

export class TaskSchedule extends AbstractAuditableResource {
    public start: string;
    public end: string;
    public task: ResourceReference;
    public slots: TaskScheduleSlotResource[];
    public permissions: TaskSchedulePermissions;

    public static fromTaskScheduleEntity(taskScheduleEntity: TaskScheduleEntity): TaskSchedule {
        if (taskScheduleEntity == null) {
            return taskScheduleEntity as any;
        }

        const {id, version, createdBy, createdDate, lastModifiedBy, lastModifiedDate, start, end, task, slots} = taskScheduleEntity;

        const schedule = new TaskSchedule();

        schedule.id = id;
        schedule.version = version;
        schedule.createdBy = createdBy;
        schedule.createdDate = createdDate;
        schedule.lastModifiedBy = lastModifiedBy;
        schedule.lastModifiedDate = lastModifiedDate;
        schedule.start = start;
        schedule.end = end;
        schedule.task = task;
        schedule.slots = slots;
        schedule.permissions = this._mapPermissions(taskScheduleEntity);

        return schedule;
    }

    private static _mapPermissions(taskSchedule: TaskScheduleEntity): TaskSchedulePermissions {
        const links = taskSchedule.permissions;

        return {
            canUpdate: links.includes(TaskScheduleEntityPermissionEnum.Update),
            canAdd: links.includes(TaskScheduleEntityPermissionEnum.Add),
        };
    }
}
