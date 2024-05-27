/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {TaskScheduleLinks} from '../../api/tasks/resources/task-schedule.resource';
import {TaskScheduleEntity} from '../../entities/task-schedule/task-schedule.entity';

export interface TaskScheduleSlice {
    items: TaskScheduleEntity[];
    lists: Map<string, AbstractList<TaskScheduleLinks>>;
}
