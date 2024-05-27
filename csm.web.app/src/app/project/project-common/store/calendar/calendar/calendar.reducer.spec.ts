/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';
import {cloneDeep} from 'lodash';

import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {CalendarExportFilters} from '../../../api/calendar/resources/calendar-export-filters';
import {CalendarUserSettings} from '../../../api/calendar/resources/calendar-user-settings';
import {CalendarExportFormatEnum} from '../../../enums/calendar-export-format.enum';
import {CalendarActions} from './calendar.actions';
import {CALENDAR_SLICE_INITIAL_STATE} from './calendar.initial-state';
import {CALENDAR_REDUCER} from './calendar.reducer';
import {CalendarSlice} from './calendar.slice';

describe('Calendar Reducer', () => {
    let initialState: CalendarSlice;
    let nextState: CalendarSlice;
    let midState: CalendarSlice;

    beforeEach(() => {
        initialState = CALENDAR_SLICE_INITIAL_STATE;
        midState = cloneDeep(CALENDAR_SLICE_INITIAL_STATE);
        nextState = cloneDeep(CALENDAR_SLICE_INITIAL_STATE);
    });

    it('should handle CalendarActions.InitializeAll', () => {
        const action = new CalendarActions.Initialize.All();

        expect(CALENDAR_REDUCER(initialState, action)).toEqual(initialState);
    });

    it('should handle CalendarActions.Set.UserSettingsFulfilled', () => {
        const userSettings = Object.assign(new CalendarUserSettings(), {
            showDayCardIndicators: true,
            showDependencyLines: true,
        });
        const action = new CalendarActions.Set.UserSettingsFulfilled(userSettings);

        nextState.userSettings = userSettings;

        expect(CALENDAR_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CalendarActions.Set.UserSettingsRejected', () => {
        const userSettings = Object.assign(new CalendarUserSettings(), {
            showDayCardIndicators: true,
            showDependencyLines: true,
        });
        const action = new CalendarActions.Set.UserSettingsRejected();

        midState.userSettings = userSettings;
        nextState.userSettings = new CalendarUserSettings();

        expect(CALENDAR_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle CalendarActions.Export.One', () => {
        const filters = new CalendarExportFilters();
        const action = new CalendarActions.Export.One('foo', filters, CalendarExportFormatEnum.Csv);

        nextState.exportRequestStatus = RequestStatusEnum.progress;

        expect(CALENDAR_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CalendarActions.Export.OneFulfilled', () => {
        const action = new CalendarActions.Export.OneFulfilled('foo');

        nextState.exportRequestStatus = RequestStatusEnum.success;

        expect(CALENDAR_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CalendarActions.Export.OneRejected', () => {
        const action = new CalendarActions.Export.OneRejected();

        nextState.exportRequestStatus = RequestStatusEnum.error;

        expect(CALENDAR_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CalendarActions.Export.OneReset', () => {
        const action = new CalendarActions.Export.OneReset();

        nextState.exportRequestStatus = RequestStatusEnum.empty;

        expect(CALENDAR_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle unknown action type', () => {
        const defaultAction: Action = {type: 'DEFAULT'};

        expect(CALENDAR_REDUCER(undefined, defaultAction)).toEqual(initialState);
    });
});
