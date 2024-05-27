/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {ActionReducer} from '@ngrx/store';

import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {CalendarScopeParameters} from '../slice/calendar.scope-parameters';
import {
    CalendarScopeActionEnum,
    CalendarScopeActions,
} from './calendar-scope.actions';
import {CALENDAR_SCOPE_SLICE_INITIAL_STATE} from './calendar-scope.initial-state';
import {CalendarScopeSlice} from './calendar-scope.slice';

export function calendarScopeReducer(state: CalendarScopeSlice = CALENDAR_SCOPE_SLICE_INITIAL_STATE,
                                     action: CalendarScopeActions): CalendarScopeSlice {
    switch (action.type) {

        case CalendarScopeActionEnum.InitializeAll:
            return CALENDAR_SCOPE_SLICE_INITIAL_STATE;

        case CalendarScopeActionEnum.InitializeFocus:
            return Object.assign<{}, CalendarScopeSlice, Partial<CalendarScopeSlice>>({}, state, {
                focus: CALENDAR_SCOPE_SLICE_INITIAL_STATE.focus,
                focusResolveStatus: CALENDAR_SCOPE_SLICE_INITIAL_STATE.focusResolveStatus,
                navigateToElement: CALENDAR_SCOPE_SLICE_INITIAL_STATE.navigateToElement,
            });

        case CalendarScopeActionEnum.InitializeScopeParameters:
            return Object.assign<{}, CalendarScopeSlice, Partial<CalendarScopeSlice>>({}, state, {
                scopeParameters: CALENDAR_SCOPE_SLICE_INITIAL_STATE.scopeParameters,
            });

        case CalendarScopeActionEnum.ResolveFocus: {
            const focusResolveStatus = RequestStatusEnum.progress;

            return Object.assign<{}, CalendarScopeSlice, Partial<CalendarScopeSlice>>({}, state, {focusResolveStatus});
        }

        case CalendarScopeActionEnum.ResolveFocusFulfilled: {
            const focus = action.payload;
            const focusResolveStatus = RequestStatusEnum.success;

            return Object.assign<{}, CalendarScopeSlice, Partial<CalendarScopeSlice>>({}, state, {focus, focusResolveStatus});
        }

        case CalendarScopeActionEnum.ResolveNavigateToElementFulfilled: {
            const navigateToElement = action.payload;

            return Object.assign<{}, CalendarScopeSlice, Partial<CalendarScopeSlice>>({}, state, {navigateToElement});
        }

        case CalendarScopeActionEnum.SetExpandedWeeks: {
            const expandedWeeks = action.payload;

            return Object.assign<{}, CalendarScopeSlice, Partial<CalendarScopeSlice>>({}, state, {expandedWeeks});
        }

        case CalendarScopeActionEnum.SetFocus: {
            const focus = action.payload;

            return Object.assign<{}, CalendarScopeSlice, Partial<CalendarScopeSlice>>({}, state, {focus});
        }

        case CalendarScopeActionEnum.SetScopeParameters:
            return Object.assign<{}, CalendarScopeSlice, Partial<CalendarScopeSlice>>({}, state, {
                scopeParameters: Object.assign(new CalendarScopeParameters(), state.scopeParameters, action.payload),
            });

        case CalendarScopeActionEnum.SetStart:
            return Object.assign<{}, CalendarScopeSlice, Partial<CalendarScopeSlice>>({}, state, {
                scopeParameters: Object.assign(new CalendarScopeParameters(), state.scopeParameters, {start: action.payload}),
            });

        case CalendarScopeActionEnum.SetMode:
            return Object.assign<{}, CalendarScopeSlice, Partial<CalendarScopeSlice>>({}, state, {
                scopeParameters: Object.assign(new CalendarScopeParameters(), state.scopeParameters, {mode: action.payload}),
            });

        default:
            return state;
    }
}

export const CALENDAR_SCOPE_REDUCER: ActionReducer<CalendarScopeSlice> = calendarScopeReducer;
