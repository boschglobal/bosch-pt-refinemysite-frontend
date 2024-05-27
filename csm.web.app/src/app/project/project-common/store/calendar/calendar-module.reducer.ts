/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ActionReducer,
    combineReducers
} from '@ngrx/store';

import {CALENDAR_REDUCER} from './calendar/calendar.reducer';
import {CalendarModuleSlice} from './calendar-module.slice';
import {CALENDAR_SCOPE_REDUCER} from './calendar-scope/calendar-scope.reducer';
import {CALENDAR_SELECTION_REDUCER} from './calendar-selection/calendar-selection.reducer';

export const CALENDAR_MODULE_REDUCERS = {
    calendarSelectionSlice: CALENDAR_SELECTION_REDUCER,
    calendarScopeSlice: CALENDAR_SCOPE_REDUCER,
    calendarSlice: CALENDAR_REDUCER,
};

export const CALENDAR_MODULE_REDUCER: ActionReducer<CalendarModuleSlice> = combineReducers(CALENDAR_MODULE_REDUCERS);
