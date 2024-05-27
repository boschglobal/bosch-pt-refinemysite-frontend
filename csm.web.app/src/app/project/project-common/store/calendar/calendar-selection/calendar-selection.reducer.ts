/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {ActionReducer} from '@ngrx/store';
import {xorBy} from 'lodash';

import {
    CalendarSelectionActions,
    CalendarSelectionActionsEnum
} from './calendar-selection.actions';
import {CALENDAR_SELECTION_SLICE_INITIAL_STATE} from './calendar-selection.initial-state';
import {CalendarSelectionSlice} from './calendar-selection.slice';

export function calendarSelectionReducer(state: CalendarSelectionSlice = CALENDAR_SELECTION_SLICE_INITIAL_STATE,
                                         action: CalendarSelectionActions): CalendarSelectionSlice {
    switch (action.type) {

        case CalendarSelectionActionsEnum.InitializeAll:
            return CALENDAR_SELECTION_SLICE_INITIAL_STATE;

        case CalendarSelectionActionsEnum.SetContext:
            return Object.assign<Object, CalendarSelectionSlice, Partial<CalendarSelectionSlice>>({}, state, {
                context: action.payload,
            });

        case CalendarSelectionActionsEnum.SetItems:
            return Object.assign<Object, CalendarSelectionSlice, Partial<CalendarSelectionSlice>>({}, state, {
                items: action.payload,
            });

        case CalendarSelectionActionsEnum.SetSelection:
            return Object.assign<Object, CalendarSelectionSlice, Partial<CalendarSelectionSlice>>({}, state, {
                isMultiSelecting: action.isMultiSelecting,
                context: action.context ? action.context : state.context,
                items: action.items ? action.items : state.items,
                action: action.action ? action.action : state.action,
            });

        case CalendarSelectionActionsEnum.SetSelectionAction:
            return Object.assign<Object, CalendarSelectionSlice, Partial<CalendarSelectionSlice>>({}, state, {
                action: action.payload,
            });

        case CalendarSelectionActionsEnum.ToggleSelectionItem:
            return Object.assign<Object, CalendarSelectionSlice, Partial<CalendarSelectionSlice>>({}, state, {
                items: xorBy(state.items, [action.payload], 'id'),
            });

        default:
            return state;
    }
}

export const CALENDAR_SELECTION_REDUCER: ActionReducer<CalendarSelectionSlice> = calendarSelectionReducer;
