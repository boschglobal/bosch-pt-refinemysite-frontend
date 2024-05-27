/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {CalendarSlice} from './calendar/calendar.slice';
import {CalendarScopeSlice} from './calendar-scope/calendar-scope.slice';
import {CalendarSelectionSlice} from './calendar-selection/calendar-selection.slice';

export interface CalendarModuleSlice {
    calendarSelectionSlice: CalendarSelectionSlice;
    calendarScopeSlice: CalendarScopeSlice;
    calendarSlice: CalendarSlice;
}
