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
import {provideMockActions} from '@ngrx/effects/testing';
import {Action} from '@ngrx/store';
import {
    BehaviorSubject,
    Observable,
    of,
    ReplaySubject,
    throwError,
} from 'rxjs';
import {
    instance,
    mock,
    when,
} from 'ts-mockito';

import {AlertMessageResource} from '../../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../../shared/alert/store/alert.actions';
import {LocalStorageService} from '../../../../../shared/local-storage/api/local-storage.service';
import {AbstractResource} from '../../../../../shared/misc/api/resources/abstract.resource';
import {
    CALENDAR_EXPORT_FORMAT_TO_FILE_TYPE,
    CalendarExportService,
} from '../../../api/calendar/calendar-export.service';
import {CalendarExportFilters} from '../../../api/calendar/resources/calendar-export-filters';
import {CalendarUserSettings} from '../../../api/calendar/resources/calendar-user-settings';
import {CalendarExportFormatEnum} from '../../../enums/calendar-export-format.enum';
import {CalendarActions} from './calendar.actions';
import {CalendarEffects} from './calendar.effects';

describe('Calendar Effects', () => {
    let calendarEffects: CalendarEffects;
    let localStorageService: jasmine.SpyObj<LocalStorageService>;
    let actions: ReplaySubject<any>;

    const calendarExportServiceMock: CalendarExportService = mock(CalendarExportService);

    const projectId = 'foo';
    const calendarExportFilters = new CalendarExportFilters();
    const calendarExportFormat = CalendarExportFormatEnum.Pdf;

    const settingsIndicatorsEnabled = new CalendarUserSettings();
    settingsIndicatorsEnabled.showDayCardIndicators = true;

    const errorResponse: Observable<any> = throwError('error');
    const calendarSettingsResponse: Observable<CalendarUserSettings> = of(settingsIndicatorsEnabled);

    const moduleDef: TestModuleMetadata = {
        providers: [
            provideMockActions(() => actions),
            CalendarEffects,
            {
                provide: CalendarExportService,
                useValue: instance(calendarExportServiceMock),
            },
            {
                provide: LocalStorageService,
                useValue: jasmine.createSpyObj('LocalStorageService', [
                    'updateCalendarUserSettings',
                    'findCalendarUserSettings',
                ]),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        calendarEffects = TestBed.inject(CalendarEffects);
        localStorageService = TestBed.inject(LocalStorageService) as jasmine.SpyObj<LocalStorageService>;
        actions = new ReplaySubject(1);
    });

    it('should trigger a CalendarActions.Set.UserSettingsFulfilled action after setting current userSettings successfully', () => {
        const expectedResult = new CalendarActions.Set.UserSettingsFulfilled(settingsIndicatorsEnabled);

        localStorageService.updateCalendarUserSettings.and.returnValue(calendarSettingsResponse);
        actions.next(new CalendarActions.Set.UserSettings(settingsIndicatorsEnabled));

        calendarEffects.setUserSettings$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a CalendarActions.Set.UserSettingsRejected action after setting current userSettings has failed', () => {
        const expectedResult = new CalendarActions.Set.UserSettingsRejected();

        localStorageService.updateCalendarUserSettings.and.returnValue(errorResponse);
        actions.next(new CalendarActions.Set.UserSettings(settingsIndicatorsEnabled));

        calendarEffects.setUserSettings$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a CalendarActions.Set.UserSettingsFulfilled action after requesting userSettings successfully', () => {
        const expectedResult = new CalendarActions.Set.UserSettingsFulfilled(settingsIndicatorsEnabled
        );
        localStorageService.findCalendarUserSettings.and.returnValue(calendarSettingsResponse);
        actions.next(new CalendarActions.Request.UserSettings());

        calendarEffects.requestUserSettings$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a CalendarActions.Set.UserSettingsRejected action after requesting current userSettings has failed', () => {
        const expectedResult = new CalendarActions.Set.UserSettingsRejected();

        localStorageService.findCalendarUserSettings.and.returnValue(errorResponse);
        actions.next(new CalendarActions.Request.UserSettings());

        calendarEffects.requestUserSettings$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a CalendarActions.Export.OneFulfilled and a AlertActions.Add.NeutralAlert action ' +
        'after a successful calendar export request', () => {
        const results: Action[] = [];
        const fileType = CALENDAR_EXPORT_FORMAT_TO_FILE_TYPE[calendarExportFormat];
        const jobId = 'bar';
        const response = new BehaviorSubject<AbstractResource>({id: jobId});
        const expectedFirstAction = new CalendarActions.Export.OneFulfilled(jobId);
        const expectedSecondAction = new AlertActions.Add.NeutralAlert(
            {message: new AlertMessageResource('Job_CalendarExportCard_RunningStatusTitle', {fileType})});

        when(calendarExportServiceMock.getFile(projectId, calendarExportFilters, calendarExportFormat)).thenReturn(response);

        actions.next(new CalendarActions.Export.One(projectId, calendarExportFilters, calendarExportFormat));

        calendarEffects.exportCalendar$.subscribe(result => results.push(result));

        const firstResult = results[0] as CalendarActions.Export.OneFulfilled;
        const secondResult = results[1] as AlertActions.Add.NeutralAlert;

        expect(firstResult).toEqual(expectedFirstAction);
        expect(secondResult.type).toBe(expectedSecondAction.type);
        expect(secondResult.payload.type).toBe(expectedSecondAction.payload.type);
        expect(secondResult.payload.message).toEqual(expectedSecondAction.payload.message);
    });

    it('should trigger a CalendarActions.Export.OneRejected action after a unsuccessful calendar export request', () => {
        const expectedAction = new CalendarActions.Export.OneRejected();

        when(calendarExportServiceMock.getFile(projectId, calendarExportFilters, calendarExportFormat)).thenReturn(errorResponse);
        actions.next(new CalendarActions.Export.One(projectId, calendarExportFilters, calendarExportFormat));

        calendarEffects.exportCalendar$.subscribe(result => expect(result).toEqual(expectedAction));
    });
});
