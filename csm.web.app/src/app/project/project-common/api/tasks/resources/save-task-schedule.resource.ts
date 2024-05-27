/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {TimeScope} from '../../../../../shared/misc/api/datatypes/time-scope.datatype';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../../shared/rest/constants/date-format.constant';
import {TaskSchedule} from '../../../models/task-schedules/task-schedule';
import {SaveTaskScheduleSlotResource} from './save-task-schedule-slot.resource';

export class SaveTaskScheduleResource {
    public start?: Date | string;
    public end?: Date | string;
    public slots: SaveTaskScheduleSlotResource[];

    constructor(start: Date | string, end: Date | string, slots: SaveTaskScheduleSlotResource[] = []) {
        this.start = start;
        this.end = end;
        this.slots = slots;
    }

    public static fromTimeScopeAndTaskSchedule(timeScope: TimeScope, taskSchedule: TaskSchedule): SaveTaskScheduleResource {
        const start = timeScope.start.format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const end = timeScope.end.format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const schedule = taskSchedule.slots.map(slot => new SaveTaskScheduleSlotResource(slot.dayCard.id, moment(slot.date)));
        return new SaveTaskScheduleResource(start, end, schedule);
    }
}
