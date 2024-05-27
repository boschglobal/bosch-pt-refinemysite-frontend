/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {ResourceReference} from '../../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../../../../../shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {AbstractAuditableResource} from '../../../../../shared/misc/api/resources/abstract-auditable.resource';
import {TaskStatusEnum} from '../../../enums/task-status.enum';
import {AttachmentListResource} from '../../attachments/resources/attachment-list.resource';
import {ProjectCraftResource} from '../../crafts/resources/project-craft.resource';
import {TaskConstraintsResource} from '../../task-constraints/resources/task-constraints.resource';
import {TaskScheduleResource} from './task-schedule.resource';

export class TaskResource extends AbstractAuditableResource {
    public project: ResourceReference;
    public name: string;
    public description: string;
    public creator: ResourceReference;
    public company?: ResourceReference;
    public location: string;
    public projectCraft: ProjectCraftResource;
    public workArea?: ResourceReference;
    public assignee?: ResourceReferenceWithPicture;
    public status: TaskStatusEnum;
    public issue: boolean;
    public assigned: boolean;
    public editDate: string;
    public _links: TaskLinks;
    public _embedded?: TaskResourceEmbeddeds;
}

export class TaskStatistics {
    public criticalTopics: number;
    public uncriticalTopics: number;
}

export class TaskLinks {
    public assign?: ResourceLink;
    public unassign?: ResourceLink;
    public send?: ResourceLink;
    public delete?: ResourceLink;
    public reset?: ResourceLink;
    public start?: ResourceLink;
    public close?: ResourceLink;
    public accept?: ResourceLink;
    public topic?: ResourceLink;
    public update?: ResourceLink;
    public updateConstraints?: ResourceLink;
}

export class TaskResourceEmbeddeds {
    public statistics: TaskStatistics;
    public attachments?: AttachmentListResource;
    public schedule?: TaskScheduleResource;
    public constraints?: TaskConstraintsResource;
}
