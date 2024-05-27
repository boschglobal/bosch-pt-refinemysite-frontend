/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../../shared/misc/helpers/enum.helper';

export enum TaskCalendarSortingModeEnum {
    Default = 'DEFAULT',
    CraftsSameLine = 'CRAFTS_SAME_LINE',
    CraftsNextLine = 'CRAFTS_NEXT_LINE',
}

export const TaskCalendarSortingModeEnumHelper = new EnumHelper('TaskCalendarSortingModeEnum', TaskCalendarSortingModeEnum);
