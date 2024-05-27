/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';
import {Moment} from 'moment';
import {
    of,
    Subject,
} from 'rxjs';
import {
    instance,
    mock,
    when,
} from 'ts-mockito';

import {MOCK_PROJECT_1} from '../../../../../test/mocks/projects';
import {MockStore} from '../../../../../test/mocks/store';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {State} from '../../../../app.reducers';
import {TimeScope} from '../../../../shared/misc/api/datatypes/time-scope.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {CALENDAR_WEEKS_BY_TASKS_CALENDAR_MODE} from '../../../../shared/misc/helpers/calendar-scope.helper';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../shared/rest/constants/date-format.constant';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {UIModule} from '../../../../shared/ui/ui.module';
import {CalendarExportFilters} from '../../api/calendar/resources/calendar-export-filters';
import {CalendarExportFormatEnum} from '../../enums/calendar-export-format.enum';
import {TasksCalendarModeEnum} from '../../enums/tasks-calendar-mode.enum';
import {CalendarActions} from '../../store/calendar/calendar/calendar.actions';
import {CalendarQueries} from '../../store/calendar/calendar/calendar.queries';
import {CalendarScopeQueries} from '../../store/calendar/calendar-scope/calendar-scope.queries';
import {ProjectSliceService} from '../../store/projects/project-slice.service';
import {ProjectTaskFilters} from '../../store/tasks/slice/project-task-filters';
import {ProjectTaskQueries} from '../../store/tasks/task-queries';
import {CalendarExportComponent} from './calendar-export.component';

describe('Calendar Export Component', () => {
    let component: CalendarExportComponent;
    let de: DebugElement;
    let fixture: ComponentFixture<CalendarExportComponent>;
    let store: Store<State>;

    const currentDate = moment();
    const clickEvent: Event = new Event('click');
    const dataAutomationExportButtonSelector = '[data-automation="export"]';
    const dataAutomationCancelButtonSelector = '[data-automation="cancel"]';
    const dataAutomationBetaFormatWarningSelector = '[data-automation="beta-format-warning"]';
    const dataAutomationIncludeOptionsSelector = '[data-automation="include-options"]';
    const dataAutomationInvalidLabelSelector = '.ss-calendar-export__checkbox-text__invalid';
    const classHiddenLabel = 'ss-calendar-export__checkbox-text__invalid--hidden';
    const dateInApril: Moment = moment('2019-04-25', 'YYYY-MM-DD');
    const dateInMay: Moment = moment('2019-05-25', 'YYYY-MM-DD');
    const dateIn18Weeks: Moment = moment('2019-08-29', 'YYYY-MM-DD');
    const dateIn3Years: Moment = moment('2022-04-25', 'YYYY-MM-DD');
    const filtersFromDate = moment('2020-03-20', API_DATE_YEAR_MONTH_DAY_FORMAT);
    const filtersToDate = moment('2020-05-20', API_DATE_YEAR_MONTH_DAY_FORMAT);
    const projectSliceServiceMock: ProjectSliceService = mock(ProjectSliceService);
    const projectTaskQueriesMock: ProjectTaskQueries = mock(ProjectTaskQueries);
    const calendarQueriesMock: CalendarQueries = mock(CalendarQueries);
    const calendarScopeQueriesMock: CalendarScopeQueries = mock(CalendarScopeQueries);
    const exportRequestStatusSubject: Subject<RequestStatusEnum> = new Subject<RequestStatusEnum>();
    const calendarScope: TimeScope = {
        start: currentDate.clone().startOf('week'),
        end: currentDate.clone().endOf('week').add(CALENDAR_WEEKS_BY_TASKS_CALENDAR_MODE[TasksCalendarModeEnum.SixWeeks] - 1, 'w'),
    };

    const generateCalendarFilters = () => {
        const filters = new ProjectTaskFilters();

        filters.criteria.from = filtersFromDate.clone();
        filters.criteria.to = filtersToDate.clone();

        return filters;
    };

    const getExportButton = () => de.query(By.css(dataAutomationExportButtonSelector)).nativeElement;
    const getCancelButton = () => de.query(By.css(dataAutomationCancelButtonSelector)).nativeElement;
    const getInvalidLabel = () => de.query(By.css(dataAutomationInvalidLabelSelector)).nativeElement;

    const setFormValue = (formKey, value) => component.form.get(formKey).setValue(value);
    const getFormValue = (formKey) => component.form.get(formKey).value;

    const calendarExportFilters: CalendarExportFilters = new CalendarExportFilters();
    const calendarTaskFilters = generateCalendarFilters();

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            BrowserAnimationsModule,
            BrowserModule,
            FormsModule,
            ReactiveFormsModule,
            TranslationModule.forRoot(),
            UIModule,
        ],
        declarations: [
            CalendarExportComponent,
        ],
        providers: [
            {
                provide: ProjectSliceService,
                useFactory: () => instance(projectSliceServiceMock),
            },
            {
                provide: ProjectTaskQueries,
                useFactory: () => instance(projectTaskQueriesMock),
            },
            {
                provide: CalendarQueries,
                useFactory: () => instance(calendarQueriesMock),
            },
            {
                provide: CalendarScopeQueries,
                useValue: instance(calendarScopeQueriesMock),
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
            {
                provide: Store,
                useValue: new MockStore({}),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CalendarExportComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        store = TestBed.inject(Store);

        calendarExportFilters.from = moment('2020-01-20');
        calendarExportFilters.to = moment('2020-07-20');
        when(projectSliceServiceMock.observeCurrentProjectId()).thenReturn(of(MOCK_PROJECT_1.id));
        when(projectTaskQueriesMock.observeCalendarFilters()).thenReturn(of(calendarTaskFilters));
        when(calendarScopeQueriesMock.observeCalendarScope()).thenReturn(of(calendarScope));
        when(calendarQueriesMock.observeExportRequestStatus()).thenReturn(exportRequestStatusSubject);

        fixture.detectChanges();
        component.ngOnInit();
    });

    it('should call handleCancel when cancel button is clicked', () => {
        spyOn(component, 'handleCancel').and.callThrough();
        getCancelButton().dispatchEvent(clickEvent);

        expect(component.handleCancel).toHaveBeenCalled();
    });

    it('should reset form when handleCancel is called', () => {
        setFormValue('range', {
            start: dateInApril,
            end: dateInMay,
        });
        setFormValue('format', CalendarExportFormatEnum.Json);
        setFormValue('includeDayCards', true);

        fixture.detectChanges();
        component.handleCancel();

        expect(getFormValue('range').start).toEqual(filtersFromDate);
        expect(getFormValue('range').end).toEqual(filtersToDate);
        expect(getFormValue('format')).toEqual(CalendarExportFormatEnum.Pdf);
        expect(getFormValue('includeDayCards')).toEqual(false);
        expect(component.isFormValid()).toBeTruthy();
    });

    it('should emit onClose when handleCancel is called', () => {
        spyOn(component.closed, 'emit').and.callThrough();
        component.handleCancel();

        expect(component.closed.emit).toHaveBeenCalled();
    });

    it('should dispatch CalendarActions.Export.OneReset when handleCancel is called', () => {
        const expectedAction = new CalendarActions.Export.OneReset();

        spyOn(store, 'dispatch').and.callThrough();

        component.handleCancel();

        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should call handleCancel when is submitting and current request status is success', () => {
        spyOn(component, 'handleCancel').and.callThrough();

        component.handleDownload();
        expect(component.handleCancel).not.toHaveBeenCalled();

        exportRequestStatusSubject.next(RequestStatusEnum.success);
        expect(component.handleCancel).toHaveBeenCalled();
    });

    it('should not call handleCancel when is not submitting and current request status is success', () => {
        spyOn(component, 'handleCancel').and.callThrough();

        exportRequestStatusSubject.next(RequestStatusEnum.progress);
        expect(component.handleCancel).not.toHaveBeenCalled();
    });

    it('should call not handleCancel when is submitting and current request status is not in success', () => {
        spyOn(component, 'handleCancel').and.callThrough();

        component.handleDownload();
        expect(component.handleCancel).not.toHaveBeenCalled();

        exportRequestStatusSubject.next(RequestStatusEnum.error);
        expect(component.handleCancel).not.toHaveBeenCalled();

        exportRequestStatusSubject.next(RequestStatusEnum.progress);
        expect(component.handleCancel).not.toHaveBeenCalled();

        exportRequestStatusSubject.next(RequestStatusEnum.empty);
        expect(component.handleCancel).not.toHaveBeenCalled();
    });

    it('should call not handleCancel when is not submitting and current request status is not in success', () => {
        spyOn(component, 'handleCancel').and.callThrough();

        exportRequestStatusSubject.next(RequestStatusEnum.error);
        expect(component.handleCancel).not.toHaveBeenCalled();

        exportRequestStatusSubject.next(RequestStatusEnum.success);
        expect(component.handleCancel).not.toHaveBeenCalled();

        exportRequestStatusSubject.next(RequestStatusEnum.empty);
        expect(component.handleCancel).not.toHaveBeenCalled();
    });

    it('should set isLoading to true when is submitting and current export request status is in progress', () => {
        component.handleDownload();
        expect(component.isLoading).toBeFalsy();

        exportRequestStatusSubject.next(RequestStatusEnum.progress);
        expect(component.isLoading).toBeTruthy();
    });

    it('should set isLoading to false when is submitting and current export request status is not progress', () => {
        component.handleDownload();
        expect(component.isLoading).toBeFalsy();

        exportRequestStatusSubject.next(RequestStatusEnum.error);
        expect(component.isLoading).toBeFalsy();

        exportRequestStatusSubject.next(RequestStatusEnum.success);
        expect(component.isLoading).toBeFalsy();

        exportRequestStatusSubject.next(RequestStatusEnum.empty);
        expect(component.isLoading).toBeFalsy();
    });

    it('should set isLoading to false when is not submitting and current export request status is progress', () => {
        exportRequestStatusSubject.next(RequestStatusEnum.progress);
        expect(component.isLoading).toBeFalsy();
    });

    it('should set isLoading to false when is not submitting and current export request status is not progress', () => {
        exportRequestStatusSubject.next(RequestStatusEnum.error);
        expect(component.isLoading).toBeFalsy();

        exportRequestStatusSubject.next(RequestStatusEnum.success);
        expect(component.isLoading).toBeFalsy();

        exportRequestStatusSubject.next(RequestStatusEnum.empty);
        expect(component.isLoading).toBeFalsy();
    });

    it('should set dates to be equal to current calendar scope if there are no filters applied', () => {
        const filters = new ProjectTaskFilters();
        when(projectTaskQueriesMock.observeCalendarFilters()).thenReturn(of(filters));

        component.ngOnInit();

        expect(getFormValue('range').start).toEqual(calendarScope.start);
        expect(getFormValue('range').end).toEqual(calendarScope.end);
    });

    it('should set dates to be equal to the calendar filter dates if they are set', () => {
        expect(getFormValue('range').start).toEqual(filtersFromDate);
        expect(getFormValue('range').end).toEqual(filtersToDate);
    });

    it('should disable export button when end date is earlier than start date', () => {
        setFormValue('range', {
            start: dateInMay,
            end: dateInApril,
        });
        fixture.detectChanges();

        const exportButtonHasDisabledAttribute: boolean = getExportButton().attributes['disabled'];

        expect(exportButtonHasDisabledAttribute).toBeTruthy();
    });

    it('should enable export button when end date is equal to start date', () => {
        setFormValue('range', {
            start: dateInMay,
            end: dateInMay,
        });
        fixture.detectChanges();

        const exportButtonHasDisabledAttribute: boolean = getExportButton().attributes['disabled'];

        expect(exportButtonHasDisabledAttribute).toBeFalsy();
    });

    it('should enable export button when end date is greater than start date', () => {
        setFormValue('range', {
            start: dateInApril,
            end: dateInMay,
        });
        fixture.detectChanges();

        const exportButtonHasDisabledAttribute: boolean = getExportButton().attributes['disabled'];

        expect(exportButtonHasDisabledAttribute).toBeFalsy();
    });

    it('should show the invalid number of weeks label only if the dates are more than 18 weeks apart and the daycards are included', () => {
        setFormValue('range', {
            start: dateInApril,
            end: dateInMay,
        });
        const label: Element = getInvalidLabel();

        expect(label.classList).toContain(classHiddenLabel);

        setFormValue('range', {
            start: dateInApril,
            end: dateIn18Weeks,
        });
        fixture.detectChanges();
        expect(label.classList).toContain(classHiddenLabel);

        setFormValue('includeDayCards', true);
        fixture.detectChanges();
        expect(label.classList).not.toContain(classHiddenLabel);

        setFormValue('range', {
            start: dateInApril,
            end: dateInMay,
        });
        fixture.detectChanges();
        expect(label.classList).toContain(classHiddenLabel);
    });

    it('should dispatch CalendarActions.Export.One when the export button is clicked and the dates are valid', () => {
        const range = {
            start: dateInApril,
            end: dateIn18Weeks,
        };
        const filters = Object.assign(new CalendarExportFilters(), {
            from: range.start,
            to: range.end,
            includeDayCards: true,
        });
        const expectedAction = new CalendarActions.Export.One(MOCK_PROJECT_1.id, filters, CalendarExportFormatEnum.Json);

        spyOn(store, 'dispatch').and.callThrough();

        setFormValue('range', range);
        setFormValue('format', CalendarExportFormatEnum.Json);
        setFormValue('includeDayCards', true);

        getExportButton().dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should not dispatch CalendarActions.Export.One when the export button is clicked with invalid dates', () => {
        const range = {
            start: dateInApril,
            end: dateIn18Weeks,
        };
        const filters = Object.assign(new CalendarExportFilters(), {
            from: range.start,
            to: range.end,
            includeDayCards: true,
        });
        const notExpectedAction = new CalendarActions.Export.One(MOCK_PROJECT_1.id, filters, CalendarExportFormatEnum.Pdf);

        spyOn(store, 'dispatch').and.callThrough();
        setFormValue('range', {
            start: dateInApril,
            end: dateIn18Weeks,
        });
        setFormValue('format', CalendarExportFormatEnum.Pdf);
        setFormValue('includeDayCards', true);

        getExportButton().dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).not.toHaveBeenCalledWith(notExpectedAction);
    });

    it('should dispatch a warning when the export button is clicked if the dates are more than 18 weeks apart ' +
        'and daycards are included', () => {
        spyOn(store, 'dispatch').and.callThrough();

        setFormValue('range', {
            start: dateInApril,
            end: dateIn18Weeks,
        });
        setFormValue('format', CalendarExportFormatEnum.Pdf);
        setFormValue('includeDayCards', true);

        getExportButton().dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledTimes(1);
    });

    it('should dispatch a warning when the export button is clicked if the dates are more than 3 years apart ' +
        'and the daycards arent included', () => {
        spyOn(store, 'dispatch').and.callThrough();

        setFormValue('range', {
            start: dateInApril,
            end: dateIn3Years,
        });
        setFormValue('format', CalendarExportFormatEnum.Pdf);
        setFormValue('includeDayCards', false);

        getExportButton().dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledTimes(1);
    });

    it('should not dispatch a warning when the export button is clicked if the dates are more than 18 weeks apart ' +
        'and daycards are included but exporting in beta format', () => {
        const range = {
            start: dateInApril,
            end: dateIn18Weeks,
        };
        const filters = Object.assign(new CalendarExportFilters(), {
            from: range.start,
            to: range.end,
            includeDayCards: true,
        });
        const expectedAction = new CalendarActions.Export.One(MOCK_PROJECT_1.id, filters, CalendarExportFormatEnum.Json);

        spyOn(store, 'dispatch').and.callThrough();

        setFormValue('range', range);
        setFormValue('format', CalendarExportFormatEnum.Json);
        setFormValue('includeDayCards', true);

        getExportButton().dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should not dispatch a warning when the export button is clicked if the dates are less than 3 years apart ' +
        'and the daycards arent included', () => {
        const range = {
            start: dateInApril,
            end: dateIn3Years.clone().subtract(1, 'd'),
        };
        const filters = Object.assign(new CalendarExportFilters(), {
            from: range.start,
            to: range.end,
            includeDayCards: false,
        });
        const expectedAction = new CalendarActions.Export.One(MOCK_PROJECT_1.id, filters, CalendarExportFormatEnum.Pdf);

        spyOn(store, 'dispatch').and.callThrough();

        setFormValue('range', range);
        setFormValue('format', CalendarExportFormatEnum.Pdf);
        setFormValue('includeDayCards', false);

        getExportButton().dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should display beta warning and hide include options checkboxes when beta format is selected', () => {
        setFormValue('format', CalendarExportFormatEnum.Json);

        fixture.detectChanges();

        expect(de.query(By.css(dataAutomationIncludeOptionsSelector))).toBeNull();
        expect(de.query(By.css(dataAutomationBetaFormatWarningSelector))).not.toBeNull();
    });

    it('should display include options checkboxes and hide beta warning when non beta format is selected', () => {
        setFormValue('format', CalendarExportFormatEnum.Pdf);

        fixture.detectChanges();

        expect(de.query(By.css(dataAutomationIncludeOptionsSelector))).not.toBeNull();
        expect(de.query(By.css(dataAutomationBetaFormatWarningSelector))).toBeNull();
    });
});
