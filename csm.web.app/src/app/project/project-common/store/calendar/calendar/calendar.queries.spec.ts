/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {provideMockStore} from '@ngrx/store/testing';

import {State} from '../../../../../app.reducers';
import {CalendarUserSettings} from '../../../api/calendar/resources/calendar-user-settings';
import {PROJECT_MODULE_INITIAL_STATE} from '../../project-module.initial-state';
import {CalendarQueries} from './calendar.queries';

describe('Calendar Queries', () => {
    let calendarQueries: CalendarQueries;

    const initialState: Pick<State, 'projectModule'> = {
        projectModule: PROJECT_MODULE_INITIAL_STATE,
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            provideMockStore({initialState}),
            CalendarQueries,
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        calendarQueries = TestBed.inject(CalendarQueries);
    });

    it('should observe calendar user settings', () => {
        const expectedResult = initialState.projectModule.calendarModule.calendarSlice.userSettings;

        calendarQueries
            .observeCalendarUserSettings()
            .subscribe((result: CalendarUserSettings) =>
                expect(result).toEqual(expectedResult));
    });

    it('should obverse export calendar request status', () => {
        const expectedStatus = initialState.projectModule.calendarModule.calendarSlice.exportRequestStatus;

        calendarQueries.observeExportRequestStatus()
            .subscribe(status => expect(status).toBe(expectedStatus));
    });
});
