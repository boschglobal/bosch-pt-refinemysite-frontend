/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {AbstractPagedListResource} from '../../../../../shared/misc/api/resources/abstract-paged-list.resource';
import {TaskResource} from './task.resource';

export class ProjectTaskListResource extends AbstractPagedListResource {
    public tasks: TaskResource[];
    public _links: TaskListLinks;
}

export class TaskListLinks {
    public self: ResourceLink;
    public create?: ResourceLink;
    public assign?: ResourceLink;
    public send?: ResourceLink;
    public start?: ResourceLink;
    public close?: ResourceLink;
}
