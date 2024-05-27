/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {TasksCalendarModeEnum} from '../../../enums/tasks-calendar-mode.enum';

export class CalendarScopeParameters {
    public start: moment.Moment;
    public mode: TasksCalendarModeEnum;
}
