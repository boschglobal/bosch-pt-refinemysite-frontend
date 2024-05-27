/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {xorWith} from 'lodash';

import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../../../../shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {AbstractResource} from '../../../../shared/misc/api/resources/abstract.resource';
import {AbstractAuditableResource} from '../../../../shared/misc/api/resources/abstract-auditable.resource';
import {AttachmentListResource} from '../../api/attachments/resources/attachment-list.resource';
import {TaskConstraintsResource} from '../../api/task-constraints/resources/task-constraints.resource';
import {TaskStatistics} from '../../api/tasks/resources/task.resource';
import {
    TaskEntity,
    TaskEntityProjectCraft
} from '../../entities/task/task.entity';
import {TaskEntityPermissionEnum} from '../../enums/task-entity-permission.enum';
import {TaskStatusEnum} from '../../enums/task-status.enum';
import {TaskSchedule} from '../task-schedules/task-schedule';

export interface TaskPermissions {
    canUpdate: boolean;
    canAssign: boolean;
    canUnassign: boolean;
    canSend: boolean;
    canDelete: boolean;
    canReset: boolean;
    canStart: boolean;
    canClose: boolean;
    canAccept: boolean;
    canUpdateConstraints: boolean;
}

export class Task extends AbstractAuditableResource {
    public project: ResourceReference;
    public name: string;
    public description: string;
    public creator: ResourceReference;
    public company?: ResourceReference;
    public location?: string;
    public projectCraft: TaskEntityProjectCraft;
    public workArea?: ResourceReference;
    public assignee?: ResourceReferenceWithPicture;
    public status: TaskStatusEnum;
    public issue: boolean;
    public assigned: boolean;
    public editDate: string;
    public permissions: TaskPermissions;
    public statistics: TaskStatistics;
    public attachments?: AttachmentListResource;
    public schedule?: TaskSchedule;
    public constraints?: TaskConstraintsResource;

    public static isEqual(a: Task, b: Task): boolean {
        return a.id === b.id && a.version === b.version
            && a.schedule.id === b.schedule.id && a.schedule.version === b.schedule.version;
    }

    public static isEqualArray<T extends AbstractResource>(a: T[], b: T[]): boolean {
        return !xorWith<T>(a, b, Task.isEqual as (typeof AbstractResource.isEqual)).length;
    }

    public static fromTaskEntity(taskEntity: TaskEntity, schedule: TaskSchedule): Task {
        if (!taskEntity) {
            return taskEntity as any;
        }

        const {
            id, version, createdBy, createdDate, lastModifiedBy, lastModifiedDate, project, name, description, creator, company,
            location, projectCraft, workArea, assignee, status, issue, assigned, editDate,
            _embedded: {statistics, constraints, attachments},
        } = taskEntity;
        const permissions = this._mapPermissions(taskEntity);

        return {
            id,
            version,
            createdBy,
            createdDate,
            lastModifiedBy,
            lastModifiedDate,
            project,
            name,
            description,
            creator,
            company,
            location,
            projectCraft,
            workArea,
            assignee,
            status,
            issue,
            assigned,
            editDate,
            permissions,
            schedule,
            statistics,
            constraints,
            attachments,
        };
    }

    private static _mapPermissions(task: TaskEntity): TaskPermissions {
        const links = task.permissions;

        return {
            canUpdate: links.includes(TaskEntityPermissionEnum.Update),
            canAssign: links.includes(TaskEntityPermissionEnum.Assign),
            canSend: links.includes(TaskEntityPermissionEnum.Send),
            canUnassign: links.includes(TaskEntityPermissionEnum.Unassign),
            canDelete: links.includes(TaskEntityPermissionEnum.Delete),
            canReset: links.includes(TaskEntityPermissionEnum.Reset),
            canStart: links.includes(TaskEntityPermissionEnum.Start),
            canClose: links.includes(TaskEntityPermissionEnum.Close),
            canAccept: links.includes(TaskEntityPermissionEnum.Accept),
            canUpdateConstraints: links.includes(TaskEntityPermissionEnum.UpdateConstraints),
        };
    }
}
