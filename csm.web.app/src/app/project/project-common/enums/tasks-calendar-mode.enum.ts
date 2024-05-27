/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../../shared/misc/helpers/enum.helper';

export enum TasksCalendarModeEnum {
    FourWeeks = 'fourweeks',
    SixWeeks = 'sixweeks',
    EighteenWeeks = 'eighteenweeks',
    TwentySixWeeks = 'twentysixweeks',
}

export const TasksCalendarModeEnumHelper = new EnumHelper('TasksCalendarModeEnum', TasksCalendarModeEnum);
