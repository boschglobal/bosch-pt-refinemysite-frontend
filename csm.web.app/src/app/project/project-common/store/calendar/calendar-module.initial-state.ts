/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {CALENDAR_SLICE_INITIAL_STATE} from './calendar/calendar.initial-state';
import {CalendarModuleSlice} from './calendar-module.slice';
import {CALENDAR_SCOPE_SLICE_INITIAL_STATE} from './calendar-scope/calendar-scope.initial-state';
import {CALENDAR_SELECTION_SLICE_INITIAL_STATE} from './calendar-selection/calendar-selection.initial-state';

export const CALENDAR_MODULE_INITIAL_STATE: CalendarModuleSlice = {
    calendarSelectionSlice: CALENDAR_SELECTION_SLICE_INITIAL_STATE,
    calendarScopeSlice: CALENDAR_SCOPE_SLICE_INITIAL_STATE,
    calendarSlice: CALENDAR_SLICE_INITIAL_STATE,
};
