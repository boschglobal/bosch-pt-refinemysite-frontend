/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../../shared/misc/helpers/enum.helper';

export enum TaskCalendarTaskViewModeEnum {
    Week = 'WEEK',
    Day = 'DAY',
}

export const TASK_CALENDAR_TASK_VIEW_MODE_ENUM_HELPER = new EnumHelper('TaskCalendarTaskViewModeEnum', TaskCalendarTaskViewModeEnum);
