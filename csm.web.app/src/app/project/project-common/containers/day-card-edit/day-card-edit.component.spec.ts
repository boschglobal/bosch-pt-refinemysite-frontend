/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';
import {
    of,
    ReplaySubject,
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_DAY_CARD_A,
    MOCK_DAY_CARD_RESOURCE_A,
    MOCK_SAVE_DAY_CARD_A
} from '../../../../../test/mocks/day-cards';
import {MOCK_TASK} from '../../../../../test/mocks/tasks';
import {MOCK_WORK_DAYS} from '../../../../../test/mocks/workdays';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../shared/rest/constants/date-format.constant';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {UIModule} from '../../../../shared/ui/ui.module';
import {SaveDayCardResource} from '../../api/day-cards/resources/save-day-card.resource';
import {WorkDaysResource} from '../../api/work-days/resources/work-days.resource';
import {DayCard} from '../../models/day-cards/day-card';
import {Task} from '../../models/tasks/task';
import {DayCardCaptureComponent} from '../../presentationals/day-card-capture/day-card-capture.component';
import {DayCardActions} from '../../store/day-cards/day-card.actions';
import {DayCardQueries} from '../../store/day-cards/day-card.queries';
import {ProjectTaskQueries} from '../../store/tasks/task-queries';
import {WorkDaysQueries} from '../../store/work-days/work-days.queries';
import {DayCardEditComponent} from './day-card-edit.component';

describe('Day Card Edit Component', () => {
    let comp: DayCardEditComponent;
    let fixture: ComponentFixture<DayCardEditComponent>;
    let store: jasmine.SpyObj<Store>;

    const dayCardQueriesMock: DayCardQueries = mock(DayCardQueries);
    const projectTaskQueriesMock: ProjectTaskQueries = mock(ProjectTaskQueries);
    const workDaysQueriesMock: WorkDaysQueries = mock(WorkDaysQueries);

    const mockedTaskStart = moment().startOf('week').add(1, 'd');
    const mockedTaskEnd = moment().endOf('week').add(1, 'd');
    const mockedTask: Task = {
        ...MOCK_TASK,
        schedule: {
            ...MOCK_TASK.schedule,
            start: mockedTaskStart.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            end: mockedTaskEnd.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
        },
    };
    const mockedDayCardA: DayCard = {
        ...MOCK_DAY_CARD_A,
        date: mockedTaskStart.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
    };

    const moduleDef: TestModuleMetadata = {
        imports: [
            FormsModule,
            ReactiveFormsModule,
            TranslationModule.forRoot(),
            UIModule,
            BrowserAnimationsModule,
            BrowserModule,
        ],
        declarations: [
            DayCardEditComponent,
            DayCardCaptureComponent,
        ],
        providers: [
            {
                provide: DayCardQueries,
                useFactory: () => instance(dayCardQueriesMock),
            },
            {
                provide: ModalService,
                useValue: {
                    currentModalData: {
                        dayCard: MOCK_DAY_CARD_RESOURCE_A,
                    },
                },
            },
            {
                provide: ProjectTaskQueries,
                useFactory: () => instance(projectTaskQueriesMock),
            },
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
            {
                provide: WorkDaysQueries,
                useValue: instance(workDaysQueriesMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DayCardEditComponent);
        comp = fixture.componentInstance;

        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;

        when(dayCardQueriesMock.observeDayCardsByTask(MOCK_DAY_CARD_A.task.id)).thenReturn(of([mockedDayCardA]));
        when(dayCardQueriesMock.observeDayCardById(MOCK_DAY_CARD_A.id)).thenReturn(of(mockedDayCardA));
        when(dayCardQueriesMock.observeCurrentDayCardRequestStatus()).thenReturn(of(RequestStatusEnum.success));
        when(projectTaskQueriesMock.observeTaskById(MOCK_DAY_CARD_A.task.id)).thenReturn(of(mockedTask));
        when(workDaysQueriesMock.observeWorkDays()).thenReturn(of(MOCK_WORK_DAYS));

        fixture.detectChanges();
        comp.ngOnInit();
    });

    it('should dispatch a DayCardActions.Update.One action when calling handleSubmit', () => {
        const expectedResult = new DayCardActions.Update.One({
            saveDayCard: MOCK_SAVE_DAY_CARD_A,
            taskId: MOCK_TASK.id,
            dayCardId: MOCK_DAY_CARD_A.id,
            dayCardVersion: MOCK_DAY_CARD_A.version,
            taskScheduleVersion: MOCK_TASK.schedule.version,
        });
        comp.handleSubmit(MOCK_SAVE_DAY_CARD_A);

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch a DayCardActions.Update.OneReset action when calling handleCancel', () => {
        const expectedResult = new DayCardActions.Update.OneReset();
        comp.handleCancel();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should reset form when calling handleCancel', () => {
        spyOn(comp.dayCardCapture, 'resetForm').and.callThrough();
        comp.handleCancel();

        expect(comp.dayCardCapture.resetForm).toHaveBeenCalled();
    });

    it('should emit onClose when calling handleCancel', () => {
        spyOn(comp.onClose, 'emit').and.callThrough();
        comp.handleCancel();

        expect(comp.onClose.emit).toHaveBeenCalled();
    });

    it('should set isLoading to TRUE when capture is submitting', () => {
        when(dayCardQueriesMock.observeCurrentDayCardRequestStatus()).thenReturn(of(RequestStatusEnum.progress));

        comp.isSubmitting = true;
        comp.ngOnInit();

        expect(comp.isLoading).toBeTruthy();
    });

    it('should set isLoading to FALSE after capture finished submitting', () => {
        when(dayCardQueriesMock.observeCurrentDayCardRequestStatus()).thenReturn(of(RequestStatusEnum.error));
        comp.ngOnInit();

        expect(comp.isLoading).toBeFalsy();
    });

    it('should call handleCancel after form was submitted successfully', () => {
        spyOn(comp, 'handleCancel').and.callThrough();
        when(dayCardQueriesMock.observeCurrentDayCardRequestStatus()).thenReturn(of(RequestStatusEnum.success));

        comp.isSubmitting = true;
        comp.ngOnInit();

        expect(comp.handleCancel).toHaveBeenCalled();
    });

    it('should set the correct date config ', () => {
        const newWorkingDays: WorkDaysResource = {...MOCK_WORK_DAYS, allowWorkOnNonWorkingDays: true};
        const expectedResult = {
            disabledDates: [],
            max: mockedTaskEnd,
            min: mockedTaskStart,
        };

        when(workDaysQueriesMock.observeWorkDays()).thenReturn(of(newWorkingDays));
        comp.ngOnInit();

        expect(comp.dateConfig.min.isSame(expectedResult.min, 'd')).toBeTruthy();
        expect(comp.dateConfig.max.isSame(expectedResult.max, 'd')).toBeTruthy();
        expect(comp.dateConfig.disabledDates).toEqual(expectedResult.disabledDates);
    });

    it('should set right default values', () => {
        const expectedResult =
            new SaveDayCardResource(MOCK_DAY_CARD_A.title, moment(mockedDayCardA.date), MOCK_DAY_CARD_A.manpower, MOCK_DAY_CARD_A.notes);

        expect(comp.defaultValues).toEqual(expectedResult);
    });

    it('should set defaultValues with latest information from store', () => {
        const updatedDayCard = Object.assign({}, MOCK_DAY_CARD_A, {notes: 'Lorem ipsum'});
        const {title, date, manpower, notes} = updatedDayCard;
        const expectedResult = new SaveDayCardResource(title, moment(date), manpower, notes);

        when(dayCardQueriesMock.observeDayCardsByTask(MOCK_DAY_CARD_A.task.id)).thenReturn(of([updatedDayCard]));
        when(dayCardQueriesMock.observeDayCardById(MOCK_DAY_CARD_A.id)).thenReturn(of(updatedDayCard));
        comp.ngOnInit();

        expect(comp.defaultValues).toEqual(expectedResult);
    });

    it('should use first Day Card value from the store to populate form and ignore subsequent changes to that value', () => {
        const updatedDayCard = Object.assign({}, MOCK_DAY_CARD_A, {notes: 'Lorem ipsum'});
        const {title, date, manpower, notes} = MOCK_DAY_CARD_A;
        const expectedResult = new SaveDayCardResource(title, moment(date), manpower, notes);
        const dayCardSource = new ReplaySubject<DayCard>(1);

        dayCardSource.next(MOCK_DAY_CARD_A);

        when(dayCardQueriesMock.observeDayCardById(MOCK_DAY_CARD_A.id)).thenReturn(dayCardSource);
        comp.ngOnInit();

        expect(comp.defaultValues).toEqual(expectedResult);

        dayCardSource.next(updatedDayCard);

        expect(comp.defaultValues).toEqual(expectedResult);
    });
});
