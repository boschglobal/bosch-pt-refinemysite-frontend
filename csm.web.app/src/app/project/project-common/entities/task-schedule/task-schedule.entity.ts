/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {AbstractAuditableResource} from '../../../../shared/misc/api/resources/abstract-auditable.resource';
import {DayCardResource} from '../../api/day-cards/resources/day-card.resource';
import {
    TaskScheduleLinks,
    TaskScheduleResource,
    TaskScheduleSlotResource
} from '../../api/tasks/resources/task-schedule.resource';
import {TaskScheduleEntityPermissionEnum} from '../../enums/task-schedule-entity-permission.enum';

export const TASK_SCHEDULE_LINKS_TO_TASK_ENTITY_PERMISSION_ENUM_MAPPER: { [key: string]: TaskScheduleEntityPermissionEnum } = {
    add: TaskScheduleEntityPermissionEnum.Add,
    move: TaskScheduleEntityPermissionEnum.Move,
    update: TaskScheduleEntityPermissionEnum.Update,
    'delete': TaskScheduleEntityPermissionEnum.Delete,
};

export class TaskScheduleEntity extends AbstractAuditableResource {
    public start: string;
    public end: string;
    public task: ResourceReference;
    public slots: TaskScheduleSlotResource[];
    public permissions: TaskScheduleEntityPermissionEnum[];
    public _embedded?: TaskScheduleEntityEmbeddeds;

    public static fromResource(taskSchedule: TaskScheduleResource): TaskScheduleEntity {
        const {
            id,
            version,
            createdBy,
            createdDate,
            lastModifiedBy,
            lastModifiedDate,
            start,
            end,
            task,
            slots,
            _links,
            _embedded,
        } = taskSchedule;

        return {
            id,
            version,
            createdBy,
            createdDate,
            lastModifiedBy,
            lastModifiedDate,
            start,
            end,
            task,
            slots,
            _embedded,
            permissions: this._mapLinksToPermissions(_links),
        }
    }

    private static _mapLinksToPermissions(links: TaskScheduleLinks): TaskScheduleEntityPermissionEnum[] {
        return Object.keys(links)
            .filter(key => !!TASK_SCHEDULE_LINKS_TO_TASK_ENTITY_PERMISSION_ENUM_MAPPER[key])
            .map(key => TASK_SCHEDULE_LINKS_TO_TASK_ENTITY_PERMISSION_ENUM_MAPPER[key]);
    }
}

export interface TaskScheduleEntityEmbeddeds {
    dayCards: TaskScheduleEntityEmbeddedsDayCards;
}

export interface TaskScheduleEntityEmbeddedsDayCards {
    items: DayCardResource[];
}
