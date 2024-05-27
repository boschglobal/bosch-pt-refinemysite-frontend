/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    omit,
    pick
} from 'lodash';

import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../../../../shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {AbstractAuditableResource} from '../../../../shared/misc/api/resources/abstract-auditable.resource';
import {AttachmentListResource} from '../../api/attachments/resources/attachment-list.resource';
import {ProjectCraftResource} from '../../api/crafts/resources/project-craft.resource';
import {TaskConstraintsResource} from '../../api/task-constraints/resources/task-constraints.resource';
import {
    TaskLinks,
    TaskResource,
    TaskResourceEmbeddeds
} from '../../api/tasks/resources/task.resource';
import {TaskEntityPermissionEnum} from '../../enums/task-entity-permission.enum';
import {TaskStatusEnum} from '../../enums/task-status.enum';

export const TASK_LINKS_TO_TASK_ENTITY_PERMISSION_ENUM_MAPPER: { [key: string]: TaskEntityPermissionEnum } = {
    assign: TaskEntityPermissionEnum.Assign,
    unassign: TaskEntityPermissionEnum.Unassign,
    send: TaskEntityPermissionEnum.Send,
    delete: TaskEntityPermissionEnum.Delete,
    reset: TaskEntityPermissionEnum.Reset,
    start: TaskEntityPermissionEnum.Start,
    close: TaskEntityPermissionEnum.Close,
    accept: TaskEntityPermissionEnum.Accept,
    topic: TaskEntityPermissionEnum.Topic,
    update: TaskEntityPermissionEnum.Update,
    updateConstraints: TaskEntityPermissionEnum.UpdateConstraints,
};

export class TaskEntity extends AbstractAuditableResource {
    public project: ResourceReference;
    public name: string;
    public description: string;
    public creator: ResourceReference;
    public company?: ResourceReference;
    public location: string;
    public projectCraft: TaskEntityProjectCraft;
    public workArea?: ResourceReference;
    public assignee?: ResourceReferenceWithPicture;
    public status: TaskStatusEnum;
    public issue: boolean;
    public assigned: boolean;
    public editDate: string;
    public permissions: TaskEntityPermissionEnum[];
    public _embedded?: TaskEntityEmbeddeds;

    public static fromResource(task: TaskResource): TaskEntity {
        const {
            id, version, createdBy, createdDate, lastModifiedBy, lastModifiedDate, project, name, description, creator, company,
            location, projectCraft: projectCraftResource, workArea, assignee, status, issue, assigned, editDate, _links,
            _embedded: embeddedResources,
        } = task;
        const projectCraft: TaskEntityProjectCraft =
            pick<ProjectCraftResource, 'id' | 'name' | 'color'>(projectCraftResource, ['id', 'name', 'color']);
        const _embedded: TaskEntityEmbeddeds = omit<TaskResourceEmbeddeds, 'schedule'>(embeddedResources, 'schedule');

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
            _embedded,
            permissions: this._mapLinksToPermissions(_links),
        };
    }

    private static _mapLinksToPermissions(links: TaskLinks): TaskEntityPermissionEnum[] {
        return Object.keys(links)
            .filter(key => !!TASK_LINKS_TO_TASK_ENTITY_PERMISSION_ENUM_MAPPER[key])
            .map(key => TASK_LINKS_TO_TASK_ENTITY_PERMISSION_ENUM_MAPPER[key]);
    }
}

export interface TaskEntityProjectCraft {
    id: string;
    color: string;
    name: string;
}

export interface TaskEntityEmbeddeds {
    statistics: TaskEntityStatistics;
    attachments?: AttachmentListResource;
    constraints?: TaskConstraintsResource;
}

interface TaskEntityStatistics {
    criticalTopics: number;
    uncriticalTopics: number;
}
