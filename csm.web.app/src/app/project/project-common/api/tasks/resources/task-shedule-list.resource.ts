/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {TaskScheduleResource} from './task-schedule.resource';

export class TaskScheduleListResource {
    public taskSchedules: TaskScheduleResource[];
    public _links: TaskScheduleListLinks;
}

export class TaskScheduleListLinks {
    public self: ResourceLink;
}
