/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {TaskScheduleLinks} from '../../api/tasks/resources/task-schedule.resource';
import {TaskScheduleSlice} from './task-schedule.slice';

export const TASK_SCHEDULE_SLICE_INITIAL_STATE: TaskScheduleSlice = {
    items: [],
    lists: new Map<string, AbstractList<TaskScheduleLinks>>(),
};
