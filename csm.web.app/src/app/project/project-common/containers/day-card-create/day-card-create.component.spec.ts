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
import {Moment} from 'moment';
import {Subject} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_DAY_CARD_A,
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
import {DayCardCreateComponent} from './day-card-create.component';

describe('Day Card Create Component', () => {
    let component: DayCardCreateComponent;
    let fixture: ComponentFixture<DayCardCreateComponent>;
    let store: jasmine.SpyObj<Store>;

    const dayCardQueriesMock = mock(DayCardQueries);
    const projectTaskQueriesMock = mock(ProjectTaskQueries);
    const workDaysQueriesMock = mock(WorkDaysQueries);

    const dayCardsSubject = new Subject<DayCard[]>();
    const dayCardsRequestStatusSubject = new Subject<RequestStatusEnum>();
    const taskSubject = new Subject<Task>();
    const workDaysSubject = new Subject<WorkDaysResource>();

    const referenceDate: Moment = moment();
    const taskId = MOCK_TASK.id;
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
    const mockedDayCard: DayCard = {
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
            DayCardCreateComponent,
            DayCardCaptureComponent,
        ],
        providers: [
            {
                provide: DayCardQueries,
                useValue: instance(dayCardQueriesMock),
            },
            {
                provide: ModalService,
                useValue: {
                    currentModalData: {
                        taskId,
                        date: referenceDate,
                    },
                },
            },
            {
                provide: ProjectTaskQueries,
                useValue: instance(projectTaskQueriesMock),
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

    when(dayCardQueriesMock.observeDayCardsByTask(taskId)).thenReturn(dayCardsSubject);
    when(dayCardQueriesMock.observeCurrentDayCardRequestStatus()).thenReturn(dayCardsRequestStatusSubject);
    when(projectTaskQueriesMock.observeTaskById(taskId)).thenReturn(taskSubject);
    when(workDaysQueriesMock.observeWorkDays()).thenReturn(workDaysSubject);

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DayCardCreateComponent);
        component = fixture.componentInstance;

        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;

        component.ngOnInit();

        dayCardsSubject.next([mockedDayCard]);
        dayCardsRequestStatusSubject.next(RequestStatusEnum.success);
        taskSubject.next(mockedTask);
        workDaysSubject.next(MOCK_WORK_DAYS);

        fixture.detectChanges();
    });

    it('should dispatch a DayCardActions.Create.One action when calling handleSubmit', () => {
        const expectedResult = new DayCardActions.Create.One({
            taskId,
            saveDayCard: MOCK_SAVE_DAY_CARD_A,
        });
        component.handleSubmit(MOCK_SAVE_DAY_CARD_A);

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch a DayCardActions.Create.OneReset action when calling handleCancel', () => {
        const expectedResult = new DayCardActions.Create.OneReset();
        component.handleCancel();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should reset form when calling handleCancel', () => {
        spyOn(component.dayCardCapture, 'resetForm').and.callThrough();
        component.handleCancel();

        expect(component.dayCardCapture.resetForm).toHaveBeenCalled();
    });

    it('should emit onClose when calling handleCancel', () => {
        spyOn(component.onClose, 'emit').and.callThrough();
        component.handleCancel();

        expect(component.onClose.emit).toHaveBeenCalled();
    });

    it('should set isLoading to TRUE when capture is submitting', () => {
        component.isSubmitting = true;
        dayCardsRequestStatusSubject.next(RequestStatusEnum.progress);

        expect(component.isLoading).toBeTruthy();
    });

    it('should set isLoading to FALSE after capture finished submitting', () => {
        dayCardsRequestStatusSubject.next(RequestStatusEnum.error);

        expect(component.isLoading).toBeFalsy();
    });

    it('should call handleCancel after form was submitted successfully', () => {
        spyOn(component, 'handleCancel').and.callThrough();

        component.isSubmitting = true;
        dayCardsRequestStatusSubject.next(RequestStatusEnum.success);

        expect(component.handleCancel).toHaveBeenCalled();
    });

    it('should set the correct date config', () => {
        const newWorkingDays: WorkDaysResource = {...MOCK_WORK_DAYS, allowWorkOnNonWorkingDays: true};
        const expectedResult = {
            disabledDates: [],
            max: mockedTaskEnd,
            min: mockedTaskStart,
        };

        component.ngOnInit();

        dayCardsSubject.next([]);
        taskSubject.next(mockedTask);
        workDaysSubject.next(newWorkingDays);

        expect(component.dateConfig.min.isSame(expectedResult.min, 'd')).toBeTruthy();
        expect(component.dateConfig.max.isSame(expectedResult.max, 'd')).toBeTruthy();
        expect(component.dateConfig.disabledDates).toEqual(expectedResult.disabledDates);
    });

    it('should set right default values', () => {
        const expectedResult = new SaveDayCardResource('', referenceDate, 1, '');

        expect(component.defaultValues).toEqual(expectedResult);
    });
});
