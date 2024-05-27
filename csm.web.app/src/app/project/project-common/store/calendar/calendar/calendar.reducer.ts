/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {ActionReducer} from '@ngrx/store';

import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {CalendarUserSettings} from '../../../api/calendar/resources/calendar-user-settings';
import {
    CalendarActionEnum,
    CalendarActions,
} from './calendar.actions';
import {CALENDAR_SLICE_INITIAL_STATE} from './calendar.initial-state';
import {CalendarSlice} from './calendar.slice';

export function calendarReducer(state: CalendarSlice = CALENDAR_SLICE_INITIAL_STATE, action: CalendarActions): CalendarSlice {
    switch (action.type) {

        case CalendarActionEnum.InitializeAll:
            return CALENDAR_SLICE_INITIAL_STATE;

        case CalendarActionEnum.SetUserSettingsFulfilled:
            return Object.assign<{}, CalendarSlice, Partial<CalendarSlice>>({}, state, {
                userSettings: Object.assign(new CalendarUserSettings(), action.payload),
            });

        case CalendarActionEnum.SetUserSettingsRejected:
            return Object.assign<{}, CalendarSlice, Partial<CalendarSlice>>({}, state, {
                userSettings: new CalendarUserSettings(),
            });

        case CalendarActionEnum.ExportOne:
            return Object.assign<{}, CalendarSlice, Partial<CalendarSlice>>({}, state, {
                exportRequestStatus: RequestStatusEnum.progress,
            });

        case CalendarActionEnum.ExportOneFulfilled:
            return Object.assign<{}, CalendarSlice, Partial<CalendarSlice>>({}, state, {
                exportRequestStatus: RequestStatusEnum.success,
            });

        case CalendarActionEnum.ExportOneRejected:
            return Object.assign<{}, CalendarSlice, Partial<CalendarSlice>>({}, state, {
                exportRequestStatus: RequestStatusEnum.error,
            });

        case CalendarActionEnum.ExportOneReset:
            return Object.assign<{}, CalendarSlice, Partial<CalendarSlice>>({}, state, {
                exportRequestStatus: RequestStatusEnum.empty,
            });

        default:
            return state;
    }
}

export const CALENDAR_REDUCER: ActionReducer<CalendarSlice> = calendarReducer;
