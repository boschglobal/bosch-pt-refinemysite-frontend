/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {NO_ERRORS_SCHEMA} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {Store} from '@ngrx/store';
import * as moment from 'moment';
import {of} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {MOCK_WORK_DAYS} from '../../../../../../../test/mocks/workdays';
import {State} from '../../../../../../app.reducers';
import {CaptureModeEnum} from '../../../../../../shared/misc/enums/capture-mode.enum';
import {ModalIdEnum} from '../../../../../../shared/misc/enums/modal-id.enum';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {WeekDaysEnum} from '../../../../../../shared/misc/enums/weekDays.enum';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../../../shared/rest/constants/date-format.constant';
import {TranslationModule} from '../../../../../../shared/translation/translation.module';
import {ModalService} from '../../../../../../shared/ui/modal/api/modal.service';
import {WorkDaysHoliday} from '../../../../../project-common/api/work-days/resources/work-days.resource';
import {
    UpdateWorkDaysPayload,
    WorkDaysActions
} from '../../../../../project-common/store/work-days/work-days.actions';
import {WorkDaysQueries} from '../../../../../project-common/store/work-days/work-days.queries';
import {
    WorkingDaysFormData,
    WorkingDaysFormDataWeekDays
} from '../../presentationals/working-days-capture/working-days-capture.component';
import {WorkingDaysHolidayFormData} from '../../presentationals/working-days-holiday-capture/working-days-holiday-capture.component';
import {
    CREATE_HOLIDAY_ITEM_ID,
    DELETE_HOLIDAY_ITEM_ID,
    EDIT_HOLIDAY_ITEM_ID,
    WorkingDaysHolidayAction
} from '../../presentationals/working-days-holidays-list/working-days-holidays-list.component';
import {WorkingDaysComponent} from './working-days.component';

describe('Working Days Component', () => {
    let component: WorkingDaysComponent;
    let fixture: ComponentFixture<WorkingDaysComponent>;
    let modalService: jasmine.SpyObj<ModalService>;
    let store: jasmine.SpyObj<Store<State>>;

    const workDaysQueriesMock: WorkDaysQueries = mock(WorkDaysQueries);

    const getWorkingDays = (selectedWorkingDays: WeekDaysEnum[]): { [key in WeekDaysEnum]: boolean } =>
        Object.keys(WeekDaysEnum).reduce((prev, curr) => ({
            ...prev,
            [curr]: selectedWorkingDays.includes(curr as WeekDaysEnum),
        }), {} as WorkingDaysFormDataWeekDays);

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            WorkingDaysComponent,
        ],
        providers: [
            {
                provide: ModalService,
                useValue: jasmine.createSpyObj('ModalService', ['open', 'close']),
            },
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
            {
                provide: WorkDaysQueries,
                useFactory: () => instance(workDaysQueriesMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WorkingDaysComponent);
        component = fixture.componentInstance;

        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
        modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;

        when(workDaysQueriesMock.observeWorkDaysRequestStatus()).thenReturn(of(RequestStatusEnum.success));
        when(workDaysQueriesMock.observeWorkDays()).thenReturn(of(MOCK_WORK_DAYS));

        modalService.close.calls.reset();
        modalService.open.calls.reset();
        store.dispatch.calls.reset();

        component.ngOnInit();

        fixture.detectChanges();
    });

    afterAll(() => component.ngOnDestroy());

    it('should set workingDaysCaptureDefaultValues after ngOnInit', () => {
        const expectedWorkingDays = getWorkingDays(MOCK_WORK_DAYS.workingDays);

        component.workingDaysCaptureDefaultValues = null;

        component.ngOnInit();

        expect(component.workingDaysCaptureDefaultValues.startOfWeek).toBe(MOCK_WORK_DAYS.startOfWeek);
        expect(component.workingDaysCaptureDefaultValues.workingDays).toEqual(expectedWorkingDays);
    });

    it('should set workOnNonWorkingDaysCaptureDefaultValue after ngOnInit', () => {
        const expectedWorkingDays = MOCK_WORK_DAYS.allowWorkOnNonWorkingDays;

        component.workingDaysCaptureDefaultValues = null;

        expect(component.workOnNonWorkingDaysCaptureDefaultValues.allowWorkOnNonWorkingDays).toBe(expectedWorkingDays);
    });

    it('should set workDaysHolidaysList after ngOnInit', () => {
        const expectedWorkingDays = MOCK_WORK_DAYS.holidays;

        component.workingDaysCaptureDefaultValues = null;

        expect(component.workDaysHolidaysList).toEqual(expectedWorkingDays);
    });

    it('should set isLoading to true when request status is progress', () => {
        when(workDaysQueriesMock.observeWorkDaysRequestStatus()).thenReturn(of(RequestStatusEnum.progress));

        component.ngOnInit();

        expect(component.isLoading).toBeTruthy();
    });

    it('should not set isLoading to true when request status is not progress', () => {
        when(workDaysQueriesMock.observeWorkDaysRequestStatus()).thenReturn(of(RequestStatusEnum.success));

        expect(component.isLoading).toBeFalsy();
    });

    it('should call modalService open when handle handleSubmit is called and startOfWeek is different ' +
        'from the current one and dispatch the correct action when confirmCallback is called', () => {
        const startOfWeek = WeekDaysEnum.THURSDAY;
        const workingDays = [WeekDaysEnum.MONDAY, WeekDaysEnum.TUESDAY];
        const updateWorkDaysPayload: UpdateWorkDaysPayload = {
            allowWorkOnNonWorkingDays: MOCK_WORK_DAYS.allowWorkOnNonWorkingDays,
            holidays: MOCK_WORK_DAYS.holidays,
            startOfWeek,
            workingDays,
        };
        const workingDayCaptureValue: WorkingDaysFormData = {startOfWeek, workingDays: getWorkingDays(workingDays)};
        const expectedResult = new WorkDaysActions.Update.One(updateWorkDaysPayload, MOCK_WORK_DAYS.version);

        modalService.open.and.callFake(params => params.data.confirmCallback());

        component.handleSubmit(workingDayCaptureValue);

        expect(modalService.open).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should not call modalService open when handle handleSubmit is called and startOfWeek is the ' +
        'same has the current one and dispatch the correct action', () => {
        const startOfWeek = MOCK_WORK_DAYS.startOfWeek;
        const workingDays = [WeekDaysEnum.MONDAY, WeekDaysEnum.TUESDAY];
        const updateWorkDaysPayload: UpdateWorkDaysPayload = {
            allowWorkOnNonWorkingDays: MOCK_WORK_DAYS.allowWorkOnNonWorkingDays,
            holidays: MOCK_WORK_DAYS.holidays,
            startOfWeek,
            workingDays,
        };

        const workingDayCaptureValue: WorkingDaysFormData = {startOfWeek, workingDays: getWorkingDays(workingDays)};
        const expectedResult = new WorkDaysActions.Update.One(updateWorkDaysPayload, MOCK_WORK_DAYS.version);

        component.handleSubmit(workingDayCaptureValue);

        expect(modalService.open).not.toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch the correct action when handleWorkOnNonWorkingDaysChange is called and change allowWorkOnNonWorkingDays', () => {
        const allowWorkOnNonWorkingDays = false;
        const updateWorkDaysPayload: UpdateWorkDaysPayload = {
            allowWorkOnNonWorkingDays,
            holidays: MOCK_WORK_DAYS.holidays,
            startOfWeek: MOCK_WORK_DAYS.startOfWeek,
            workingDays: MOCK_WORK_DAYS.workingDays,
        };
        const expectedResult = new WorkDaysActions.Update.One(updateWorkDaysPayload, MOCK_WORK_DAYS.version);

        component.handleWorkOnNonWorkingDaysChange(allowWorkOnNonWorkingDays);

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should trigger WorkDaysActions.Request.One on ngOnInit', () => {
        const expectedAction = new WorkDaysActions.Request.One();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should close modal when modalClose is triggered', () => {
        component.closeModal();

        expect(modalService.close).toHaveBeenCalled();
    });

    it(`should open UpdateWorkingDaysHoliday modal to create when handleWorkingDaysHolidayActions ` +
        `is called with ${CREATE_HOLIDAY_ITEM_ID} action and dispatch the correct action when capture is submitted and close modal`, () => {
        const {allowWorkOnNonWorkingDays, workingDays, startOfWeek} = MOCK_WORK_DAYS;
        const newListHoliday = MOCK_WORK_DAYS.holidays;
        const newHolidayFormData: WorkingDaysHolidayFormData = {
            name: 'foo',
            date: moment(),
        };
        const newHoliday: WorkDaysHoliday = {
            name: newHolidayFormData.name,
            date: newHolidayFormData.date.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
        };
        const workingDaysHolidayAction: WorkingDaysHolidayAction = {
            id: CREATE_HOLIDAY_ITEM_ID,
        };
        const updateWorkDaysPayload: UpdateWorkDaysPayload = {
            allowWorkOnNonWorkingDays,
            workingDays,
            startOfWeek,
            holidays: [...newListHoliday, newHoliday],
        };
        const expectedResult = new WorkDaysActions.Update.One(updateWorkDaysPayload, MOCK_WORK_DAYS.version);

        modalService.open.and.callFake(() => component.handleSubmitWorkingDaysHoliday(newHolidayFormData));

        component.handleWorkingDaysHolidayActions(workingDaysHolidayAction);

        expect(component.modalWorkingDaysHolidayTitle).toEqual('WorkingDays_NewNonWorkingDay_Title');
        expect(component.workingDaysHolidayCaptureDefaultValues).toBeNull();
        expect(component.modalWorkingDaysHolidayType).toEqual(CaptureModeEnum.create);
        expect(modalService.open).toHaveBeenCalledWith({
            id: ModalIdEnum.UpdateWorkingDaysHoliday,
            data: null,
        });
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
        expect(modalService.close).toHaveBeenCalled();
    });

    it(`should open UpdateWorkingDaysHoliday modal to edit when handleWorkingDaysHolidayActions ` +
        `is called with ${EDIT_HOLIDAY_ITEM_ID} action and dispatch the correct action when capture is submitted and close modal`, () => {
        const holidayToEdit = MOCK_WORK_DAYS.holidays[0];
        const holidayToEditFormData: WorkingDaysHolidayFormData = {name: holidayToEdit.name, date: moment(holidayToEdit.date)};
        const newHolidaysList = MOCK_WORK_DAYS.holidays.filter(holiday => holiday !== holidayToEdit);
        const newHolidayFormData: WorkingDaysHolidayFormData = {
            name: 'foo',
            date: moment('2023-01-01'),
        };
        const newHoliday: WorkDaysHoliday = {
            name: newHolidayFormData.name,
            date: newHolidayFormData.date.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
        };
        const {allowWorkOnNonWorkingDays, workingDays, startOfWeek} = MOCK_WORK_DAYS;
        const updateWorkDaysPayload: UpdateWorkDaysPayload = {
            allowWorkOnNonWorkingDays,
            workingDays,
            startOfWeek,
            holidays: [newHoliday, ...newHolidaysList],
        };
        const expectedResult = new WorkDaysActions.Update.One(updateWorkDaysPayload, MOCK_WORK_DAYS.version);
        const workingDaysHolidayAction: WorkingDaysHolidayAction = {
            id: EDIT_HOLIDAY_ITEM_ID,
            holiday: holidayToEdit,
        };

        modalService.open.and.callFake(() => component.handleSubmitWorkingDaysHoliday(newHolidayFormData));

        component.handleWorkingDaysHolidayActions(workingDaysHolidayAction);

        expect(component.modalWorkingDaysHolidayTitle).toEqual('WorkingDays_UpdateNonWorkingDays_Title');
        expect(component.workingDaysHolidayCaptureDefaultValues).toEqual(holidayToEditFormData);
        expect(component.modalWorkingDaysHolidayType).toEqual(CaptureModeEnum.update);
        expect(modalService.open).toHaveBeenCalledWith({
            id: ModalIdEnum.UpdateWorkingDaysHoliday,
            data: holidayToEditFormData,
        });
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
        expect(modalService.close).toHaveBeenCalled();
    });

    it(`should call modalService open when handleWorkingDaysHolidayActions is called with ` +
        `${DELETE_HOLIDAY_ITEM_ID} action and dispatch the correct action when confirmCallback is called and close modal`, () => {
        const holidayToRemove = MOCK_WORK_DAYS.holidays[0];
        const newList = [MOCK_WORK_DAYS.holidays[1]];
        const workingDaysHolidayAction: WorkingDaysHolidayAction = {
            id: DELETE_HOLIDAY_ITEM_ID,
            holiday: holidayToRemove,
        };
        const {allowWorkOnNonWorkingDays, workingDays, startOfWeek} = MOCK_WORK_DAYS;
        const updateWorkDaysPayload: UpdateWorkDaysPayload = {
            allowWorkOnNonWorkingDays,
            workingDays,
            startOfWeek,
            holidays: newList,
        };
        const expectedResult = new WorkDaysActions.Update.One(updateWorkDaysPayload, MOCK_WORK_DAYS.version);

        modalService.open.and.callFake(params => params.data.confirmCallback());

        component.handleWorkingDaysHolidayActions(workingDaysHolidayAction);

        expect(modalService.open).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
        expect(modalService.close).toHaveBeenCalled();
    });
});
