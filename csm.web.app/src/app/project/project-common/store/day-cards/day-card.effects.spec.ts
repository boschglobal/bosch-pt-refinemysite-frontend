/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */
import {
    fakeAsync,
    TestBed,
    TestModuleMetadata,
    tick,
    waitForAsync
} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {
    Action,
    Store
} from '@ngrx/store';
import * as moment from 'moment';
import {
    BehaviorSubject,
    Observable,
    of,
    ReplaySubject,
    Subject,
    Subscription,
    throwError
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_DAY_CARD_A,
    MOCK_DAY_CARD_B,
    MOCK_DAY_CARD_RESOURCE_A,
    MOCK_DAY_CARD_RESOURCE_B,
    MOCK_DAY_CARD_WITHOUT_DATE,
    MOCK_SAVE_DAY_CARD_A,
} from '../../../../../test/mocks/day-cards';
import {
    MOCK_PROJECT_1,
    MOCK_PROJECT_2
} from '../../../../../test/mocks/projects';
import {
    MOCK_SCHEDULE_ITEM_A,
    MOCK_TASK_SCHEDULE_RESOURCE_A,
    MOCK_TASK_SCHEDULE_RESOURCE_B
} from '../../../../../test/mocks/task-schedules';
import {
    MOCK_TASK,
    MOCK_TASK_2
} from '../../../../../test/mocks/tasks';
import {MOCK_WORK_DAYS} from '../../../../../test/mocks/workdays';
import {RealtimeQueriesStub} from '../../../../../test/stubs/realtime-queries.stub';
import {RealtimeServiceStub} from '../../../../../test/stubs/realtime-service.stub';
import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectIdentifierPairWithVersion} from '../../../../shared/misc/api/datatypes/object-identifier-pair-with-version.datatype';
import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {AbstractItemsResource} from '../../../../shared/misc/api/resources/abstract-items.resource';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {WeekDaysEnum} from '../../../../shared/misc/enums/weekDays.enum';
import {RealtimeService} from '../../../../shared/realtime/api/realtime.service';
import {RealtimeEventUpdateDataResource} from '../../../../shared/realtime/api/resources/realtime-event-update-data.resource';
import {EventTypeEnum} from '../../../../shared/realtime/enums/event-type.enum';
import {RealtimeQueries} from '../../../../shared/realtime/store/realtime.queries';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../shared/rest/constants/date-format.constant';
import {DayCardService} from '../../api/day-cards/day-card.service';
import {DayCardResource} from '../../api/day-cards/resources/day-card.resource';
import {SaveDeleteDayCardResource} from '../../api/day-cards/resources/save-delete-day-card.resource';
import {TaskScheduleService} from '../../api/task-schedueles/task-schedule.service';
import {SaveTaskScheduleResource} from '../../api/tasks/resources/save-task-schedule.resource';
import {SaveTaskScheduleSlotResource} from '../../api/tasks/resources/save-task-schedule-slot.resource';
import {TaskScheduleResource} from '../../api/tasks/resources/task-schedule.resource';
import {
    WorkDaysHoliday,
    WorkDaysResource
} from '../../api/work-days/resources/work-days.resource';
import {TaskScheduleEntity} from '../../entities/task-schedule/task-schedule.entity';
import {DayCard} from '../../models/day-cards/day-card';
import {TaskSchedule} from '../../models/task-schedules/task-schedule';
import {CalendarSelectionActions} from '../calendar/calendar-selection/calendar-selection.actions';
import {CalendarSelectionQueries} from '../calendar/calendar-selection/calendar-selection.queries';
import {ProjectSliceService} from '../projects/project-slice.service';
import {WorkDaysQueries} from '../work-days/work-days.queries';
import {
    CancelAllDayCardPayload,
    CancelDayCardPayload,
    CreateDayCardPayload,
    DayCardActions,
    DeleteAllDayCardPayload,
    DeleteDayCardPayload,
    UpdateDayCardPayload,
    UpdateSlotsPayload
} from './day-card.actions';
import {
    DAY_CARD_UPDATE_EVENTS_DEBOUNCE_TIME,
    DayCardEffects
} from './day-card.effects';
import {DayCardQueries} from './day-card.queries';

describe('Day Card Effects', () => {
    let dayCardEffects: DayCardEffects;
    let dayCardService: jasmine.SpyObj<DayCardService>;
    let disposableSubscription = new Subscription();
    let taskScheduleService: any;
    let actions: ReplaySubject<any>;

    const calendarSelectionQueriesMock: CalendarSelectionQueries = mock(CalendarSelectionQueries);
    const dayCardQueriesMock: DayCardQueries = mock(DayCardQueries);
    const projectSliceServiceMock: ProjectSliceService = mock(ProjectSliceService);
    const workDaysQueriesMock: WorkDaysQueries = mock(WorkDaysQueries);

    const dayCardIds = [MOCK_DAY_CARD_A.id];

    const dayCardResourceMock = MOCK_DAY_CARD_RESOURCE_A;
    const dayCardResourceMock2 = MOCK_DAY_CARD_RESOURCE_B;
    const dayCardResourceMock3: DayCardResource = {
        ...MOCK_DAY_CARD_WITHOUT_DATE,
        task: new ResourceReference(MOCK_TASK_2.id, MOCK_TASK_2.id),
    };
    const dayCardIdsFromSameTask = [dayCardResourceMock.id, dayCardResourceMock2.id];
    const dayCardIdsFromDifferentTasks = [dayCardResourceMock.id, dayCardResourceMock3.id];
    const dayCardListMock = [dayCardResourceMock];
    const dayCardMock = DayCard.fromDayCardResource(dayCardResourceMock, '2018-01-20');
    const dayCardMock2 = DayCard.fromDayCardResource(dayCardResourceMock2, '2018-01-21');
    const dayCardMock3 = DayCard.fromDayCardResource(dayCardResourceMock3, '2018-01-22');
    const dayCardListFromSameTask = [dayCardResourceMock, dayCardResourceMock2];
    const taskScheduleResourceMock = MOCK_TASK_SCHEDULE_RESOURCE_A;
    const taskScheduleResourceMock2 = MOCK_TASK_SCHEDULE_RESOURCE_B;
    const taskScheduleEntityMock = TaskScheduleEntity.fromResource(taskScheduleResourceMock);
    const taskScheduleEntityMock2 = TaskScheduleEntity.fromResource(taskScheduleResourceMock2);
    const taskScheduleMock = TaskSchedule.fromTaskScheduleEntity(taskScheduleEntityMock);
    const taskScheduleMock2 = TaskSchedule.fromTaskScheduleEntity(taskScheduleEntityMock2);
    const workDaysMock = MOCK_WORK_DAYS;
    const context: ReplaySubject<ObjectIdentifierPair> = new ReplaySubject(1);
    const updates: ReplaySubject<RealtimeEventUpdateDataResource> = new Subject() as ReplaySubject<RealtimeEventUpdateDataResource>;
    const getOneResponse: Observable<DayCardResource> = of(dayCardResourceMock);
    const getAllByTaskResponse: Observable<TaskScheduleResource> = of(taskScheduleResourceMock);
    const updateOneResponse: Observable<DayCardResource> = of(dayCardResourceMock);
    const updateOneWithScheduleResponse: Observable<TaskScheduleResource> = of(taskScheduleResourceMock);
    const errorResponse: Observable<any> = throwError('error');
    const cancelAllPayload: CancelAllDayCardPayload = {dayCardIds, reason: 'BAD_WEATHER'};
    const deleteAllPayloadFromSameTask: DeleteAllDayCardPayload = {dayCardIds: dayCardIdsFromSameTask};
    const deleteAllPayloadFromDifferentTasks: DeleteAllDayCardPayload = {dayCardIds: dayCardIdsFromDifferentTasks};

    const dayCardByIdSubject = new BehaviorSubject<DayCard>(dayCardMock);
    const taskScheduleByTaskIdSubject = new BehaviorSubject<TaskSchedule>(taskScheduleMock);
    const workDaysSubject = new BehaviorSubject<WorkDaysResource>(workDaysMock);
    const calendarSelectionItemsSubject = new BehaviorSubject<ObjectIdentifierPair[]>([]);

    const taskId = dayCardMock.task.id;
    const taskId2 = MOCK_TASK_2.id;
    const dayCardId = dayCardMock.id;
    const dayCardVersion = 1;
    const taskScheduleVersion = 2;
    const currentDate = moment(MOCK_DAY_CARD_A.date).subtract(1, 'd');
    const startOfWeekDate: moment.Moment = moment().startOf('week').add(1, 'd');
    const createDayCardPayload: CreateDayCardPayload = {
        taskId,
        saveDayCard: MOCK_SAVE_DAY_CARD_A,
    };
    const deleteDayCardPayload: DeleteDayCardPayload = {
        taskId,
        dayCardId,
    };
    const updateDayCardPayload: UpdateDayCardPayload = {
        taskId,
        dayCardId,
        dayCardVersion,
        taskScheduleVersion,
        saveDayCard: MOCK_SAVE_DAY_CARD_A,
    };
    const updateSlotsPayload: UpdateSlotsPayload = {
        taskId,
        dayCardId,
        currentDate,
    };
    const cancelDayCardPayload: CancelDayCardPayload = {
        dayCardId,
        reason: 'BAD_WEATHER',
    };
    const fullWeekOfWorkingDays: WeekDaysEnum[] = [
        WeekDaysEnum.MONDAY,
        WeekDaysEnum.TUESDAY,
        WeekDaysEnum.WEDNESDAY,
        WeekDaysEnum.THURSDAY,
        WeekDaysEnum.FRIDAY,
        WeekDaysEnum.SATURDAY,
        WeekDaysEnum.SUNDAY,
    ];

    const moduleDef: TestModuleMetadata = {
        providers: [
            DayCardEffects,
            provideMockActions(() => actions),
            {
                provide: CalendarSelectionQueries,
                useValue: instance(calendarSelectionQueriesMock),
            },
            {
                provide: DayCardQueries,
                useValue: instance(dayCardQueriesMock),
            },
            {
                provide: DayCardService,
                useValue: jasmine.createSpyObj('DayCardService', [
                    'findOne', 'findAll', 'create', 'delete', 'deleteAll', 'update', 'approve', 'approveAll', 'cancel',
                    'cancelAll', 'complete', 'completeAll', 'reset',
                ]),
            },
            {
                provide: ProjectSliceService,
                useValue: instance(projectSliceServiceMock),
            },
            {
                provide: TaskScheduleService,
                useValue: jasmine.createSpyObj('TaskScheduleService', ['findOneByTaskId', 'update', 'findAllFromTasks']),
            },
            {
                provide: RealtimeQueries,
                useValue: new RealtimeQueriesStub(context),
            },
            {
                provide: RealtimeService,
                useValue: new RealtimeServiceStub(updates),
            },
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
            {
                provide: WorkDaysQueries,
                useValue: instance(workDaysQueriesMock),
            },
        ],
    };

    when(dayCardQueriesMock.observeDayCardById(dayCardId)).thenReturn(dayCardByIdSubject);
    when(dayCardQueriesMock.observeDayCardById(dayCardMock2.id)).thenReturn(of(dayCardMock2));
    when(dayCardQueriesMock.observeDayCardById(dayCardMock3.id)).thenReturn(of(dayCardMock3));
    when(dayCardQueriesMock.observeTaskScheduleByTaskId(taskId)).thenReturn(taskScheduleByTaskIdSubject);
    when(dayCardQueriesMock.observeTaskScheduleByTaskId(taskId2)).thenReturn(of(taskScheduleMock2));
    when(projectSliceServiceMock.observeCurrentProjectId()).thenReturn(of(MOCK_PROJECT_1.id));
    when(workDaysQueriesMock.observeWorkDays()).thenReturn(workDaysSubject);
    when(calendarSelectionQueriesMock.observeCalendarSelectionItems()).thenReturn(calendarSelectionItemsSubject);

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        dayCardEffects = TestBed.inject(DayCardEffects);
        dayCardService = TestBed.inject(DayCardService) as jasmine.SpyObj<DayCardService>;
        taskScheduleService = TestBed.inject(TaskScheduleService);

        dayCardService.approveAll.calls.reset();
        dayCardService.completeAll.calls.reset();
        dayCardService.cancelAll.calls.reset();
        dayCardService.deleteAll.calls.reset();

        actions = new ReplaySubject(1);
    });

    afterEach(() => disposableSubscription.unsubscribe());

    it('should trigger a RequestOneDayCardFulfilled', () => {
        const expectedResult = new DayCardActions.Request.OneFulfilled(MOCK_DAY_CARD_RESOURCE_A);

        dayCardService.findOne.and.returnValue(getOneResponse);
        actions.next(new DayCardActions.Request.One(dayCardId));
        dayCardEffects.requestOneDayCard$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a RequestOneDayCardRejected', () => {
        const expectedResult = new DayCardActions.Request.OneRejected();

        dayCardService.findOne.and.returnValue(errorResponse);
        actions.next(new DayCardActions.Request.One(dayCardId));
        dayCardEffects.requestOneDayCard$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a RequestAllDayCardsByTaskFulfilled', () => {
        const expectedResult = new DayCardActions.Request.AllByTaskFulfilled(MOCK_TASK_SCHEDULE_RESOURCE_A);

        taskScheduleService.findOneByTaskId.and.returnValue(getAllByTaskResponse);
        actions.next(new DayCardActions.Request.AllByTask(taskId));
        dayCardEffects.requestAllDayCardsByTask$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a RequestAllDayCardsByTaskRejected', () => {
        const expectedResult = new DayCardActions.Request.AllByTaskRejected(taskId);

        taskScheduleService.findOneByTaskId.and.returnValue(errorResponse);
        actions.next(new DayCardActions.Request.AllByTask(taskId));
        dayCardEffects.requestAllDayCardsByTask$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should fetch Task Schedules in chunks of 500', () => {
        const taskIds = new Array(600).fill(taskId);
        const expectedResult =
            new DayCardActions.Request.AllFromTasksFulfilled([MOCK_TASK_SCHEDULE_RESOURCE_A, MOCK_TASK_SCHEDULE_RESOURCE_A]);
        const expectedAmountOfChunks = Math.ceil(taskIds.length / 500);

        taskScheduleService.findAllFromTasks.and.returnValue(of([MOCK_TASK_SCHEDULE_RESOURCE_A]));
        actions.next(new DayCardActions.Request.AllFromTasks(taskIds));
        dayCardEffects.requestAllDayCardsFromTasks$.subscribe(result => {
            expect(taskScheduleService.findAllFromTasks).toHaveBeenCalledTimes(expectedAmountOfChunks);
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a RequestAllDayCardsFromTasksFulfilled', () => {
        const expectedResult = new DayCardActions.Request.AllFromTasksFulfilled([MOCK_TASK_SCHEDULE_RESOURCE_A]);

        taskScheduleService.findAllFromTasks.and.returnValue(of([MOCK_TASK_SCHEDULE_RESOURCE_A]));
        actions.next(new DayCardActions.Request.AllFromTasks([taskId]));
        dayCardEffects.requestAllDayCardsFromTasks$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a RequestAllDayCardsFromTasksRejected', () => {
        const expectedResult = new DayCardActions.Request.AllFromTasksRejected([taskId]);

        taskScheduleService.findAllFromTasks.and.returnValue(errorResponse);
        actions.next(new DayCardActions.Request.AllFromTasks([taskId]));
        dayCardEffects.requestAllDayCardsFromTasks$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a CreateOneDayCardFulfilled', () => {
        const expectedResult = new DayCardActions.Create.OneFulfilled(MOCK_TASK_SCHEDULE_RESOURCE_A);

        dayCardService.create.and.returnValue(getAllByTaskResponse);
        actions.next(new DayCardActions.Create.One(createDayCardPayload));
        dayCardEffects.create$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a CreateOneDayCardRejected', () => {
        const expectedResult = new DayCardActions.Create.OneRejected(createDayCardPayload.taskId);

        dayCardService.create.and.returnValue(errorResponse);
        actions.next(new DayCardActions.Create.One(createDayCardPayload));
        dayCardEffects.create$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action after a CreateOneDayCardFulfilled action is triggered', () => {
        const key = 'DayCardCreateCaptureComponent_Success';
        const expectedResult = new AlertActions.Add.SuccessAlert({message: new AlertMessageResource(key)});

        actions.next(new DayCardActions.Create.OneFulfilled(MOCK_TASK_SCHEDULE_RESOURCE_A));
        dayCardEffects.createSuccess$.subscribe(result => {
            expect(result.type).toBe(expectedResult.type);
        });
    });

    it('should trigger a DeleteOneDayCardFulfilled', () => {
        const expectedResult = new DayCardActions.Delete.OneFulfilled(MOCK_TASK_SCHEDULE_RESOURCE_A);

        dayCardService.delete.and.returnValue(getAllByTaskResponse);
        actions.next(new DayCardActions.Delete.One(deleteDayCardPayload));
        dayCardEffects.delete$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a DeleteOneDayCardRejected', () => {
        const expectedResult = new DayCardActions.Delete.OneRejected();

        dayCardService.delete.and.returnValue(errorResponse);
        actions.next(new DayCardActions.Delete.One(deleteDayCardPayload));
        dayCardEffects.delete$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action after a DeleteOneDayCardFulfilled action is triggered', () => {
        const key = 'DayCardDelete_Success';
        const expectedResult: Action = new AlertActions.Add.SuccessAlert({message: new AlertMessageResource(key)});

        actions.next(new DayCardActions.Delete.OneFulfilled(MOCK_TASK_SCHEDULE_RESOURCE_A));
        dayCardEffects.deleteSuccess$.subscribe(result => {
            expect(result.type).toBe(expectedResult.type);
        });
    });

    it('should trigger a UpdateOneDayCardRejected when update of day card fails', () => {
        const expectedResult = new DayCardActions.Update.OneRejected();

        dayCardService.update.and.returnValue(errorResponse);
        actions.next(new DayCardActions.Update.One(updateDayCardPayload));
        dayCardEffects.update$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a OneWithScheduleFulfilled when update of day card and the schedule are both successful', () => {
        const expectedResult = new DayCardActions.Update.OneWithScheduleFulfilled(MOCK_TASK_SCHEDULE_RESOURCE_A);

        dayCardService.update.and.returnValue(updateOneResponse);
        taskScheduleService.update.and.returnValue(updateOneWithScheduleResponse);
        actions.next(new DayCardActions.Update.One(updateDayCardPayload));
        dayCardEffects.update$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a UpdateOneDayCardPartiallyFulfilled when update of day card is successful ' +
        'but the update of the schedule fails', () => {
        const expectedResult = new DayCardActions.Update.OnePartiallyFulfilled(MOCK_DAY_CARD_RESOURCE_A);

        dayCardService.update.and.returnValue(updateOneResponse);
        taskScheduleService.update.and.returnValue(errorResponse);
        actions.next(new DayCardActions.Update.One(updateDayCardPayload));
        dayCardEffects.update$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a UpdateOneDayCardFulfilled when update of day card is successful and there\'s  no change in the date', () => {
        const expectedResult = new DayCardActions.Update.OneFulfilled(MOCK_DAY_CARD_RESOURCE_A);
        const updateDayCardWithoutSchedulePayload = Object.assign({}, updateDayCardPayload, {
            saveDayCard: Object.assign({}, updateDayCardPayload.saveDayCard, {
                date: moment(MOCK_DAY_CARD_A.date),
            }),
        });

        dayCardService.update.and.returnValue(updateOneResponse);
        actions.next(new DayCardActions.Update.One(updateDayCardWithoutSchedulePayload));
        dayCardEffects.update$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action with the right type after a ' +
        'UpdateOneDayCardFulfilled action is triggered', () => {
        const key = 'DayCard_Edit_SuccessMessage';
        const expectedResult = new AlertActions.Add.SuccessAlert({message: new AlertMessageResource(key)});

        actions.next(new DayCardActions.Update.OneFulfilled(MOCK_DAY_CARD_RESOURCE_A));
        dayCardEffects.updateSuccess$.subscribe((result: AlertActions.Add.SuccessAlert) => {
            expect(result.type).toBe(expectedResult.type);
            expect(result.payload.type).toBe(expectedResult.payload.type);
            expect(result.payload.message).toEqual(expectedResult.payload.message);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action with the right type after a ' +
        'OneWithScheduleFulfilled action is triggered', () => {
        const key = 'DayCard_Edit_SuccessMessage';
        const expectedResult = new AlertActions.Add.SuccessAlert({message: new AlertMessageResource(key)});

        actions.next(new DayCardActions.Update.OneWithScheduleFulfilled(MOCK_TASK_SCHEDULE_RESOURCE_A));
        dayCardEffects.updateSuccess$.subscribe((result: AlertActions.Add.SuccessAlert) => {
            expect(result.type).toBe(expectedResult.type);
            expect(result.payload.type).toBe(expectedResult.payload.type);
            expect(result.payload.message).toEqual(expectedResult.payload.message);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action with the right type after a UpdateSlotsFulfilled action is triggered', () => {
        const key = 'DayCard_Edit_SuccessMessage';
        const expectedResult = new AlertActions.Add.SuccessAlert({message: new AlertMessageResource(key)});

        actions.next(new DayCardActions.Update.SlotsFulfilled(MOCK_TASK_SCHEDULE_RESOURCE_A));
        dayCardEffects.updateSuccess$.subscribe((result: AlertActions.Add.SuccessAlert) => {
            expect(result.type).toBe(expectedResult.type);
            expect(result.payload.type).toBe(expectedResult.payload.type);
            expect(result.payload.message).toEqual(expectedResult.payload.message);
        });
    });

    it('should trigger a AlertActions.Add.WarningAlert action with the right type after a ' +
        'UpdateOneDayCardPartiallyFulfilled action is triggered', () => {
        const key = 'DayCard_Edit_PartialSuccessMessage';
        const expectedResult = new AlertActions.Add.WarningAlert({message: new AlertMessageResource(key)});

        actions.next(new DayCardActions.Update.OnePartiallyFulfilled(MOCK_DAY_CARD_RESOURCE_A));
        dayCardEffects.updateSuccess$.subscribe((result: AlertActions.Add.WarningAlert) => {
            expect(result.type).toBe(expectedResult.type);
            expect(result.payload.type).toBe(expectedResult.payload.type);
            expect(result.payload.message).toEqual(expectedResult.payload.message);
        });
    });

    it('should trigger a ApproveOneDayCardFulfilled', () => {
        const expectedResult = new DayCardActions.Approve.OneFulfilled(MOCK_DAY_CARD_RESOURCE_A);

        dayCardService.approve.and.returnValue(getOneResponse);
        actions.next(new DayCardActions.Approve.One(dayCardId));
        dayCardEffects.approve$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ApproveOneDayCardRejected', () => {
        const expectedResult = new DayCardActions.Approve.OneRejected();

        dayCardService.approve.and.returnValue(errorResponse);
        actions.next(new DayCardActions.Approve.One(dayCardId));
        dayCardEffects.approve$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a CancelOneDayCardFulfilled', () => {
        const expectedResult = new DayCardActions.Cancel.OneFulfilled(MOCK_DAY_CARD_RESOURCE_A);

        dayCardService.cancel.and.returnValue(getOneResponse);
        actions.next(new DayCardActions.Cancel.One(cancelDayCardPayload));
        dayCardEffects.cancel$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a CancelOneDayCardRejected', () => {
        const expectedResult = new DayCardActions.Cancel.OneRejected();

        dayCardService.cancel.and.returnValue(errorResponse);
        actions.next(new DayCardActions.Cancel.One(cancelDayCardPayload));
        dayCardEffects.cancel$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a CompleteOneDayCardFulfilled', () => {
        const expectedResult = new DayCardActions.Complete.OneFulfilled(MOCK_DAY_CARD_RESOURCE_A);

        dayCardService.complete.and.returnValue(getOneResponse);
        actions.next(new DayCardActions.Complete.One(dayCardId));
        dayCardEffects.complete$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a CompleteOneDayCardRejected', () => {
        const expectedResult = new DayCardActions.Complete.OneRejected();

        dayCardService.complete.and.returnValue(errorResponse);
        actions.next(new DayCardActions.Complete.One(dayCardId));
        dayCardEffects.complete$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ResetOneDayCardFulfilled', () => {
        const expectedResult = new DayCardActions.Reset.OneFulfilled(MOCK_DAY_CARD_RESOURCE_A);

        dayCardService.reset.and.returnValue(getOneResponse);
        actions.next(new DayCardActions.Reset.One(dayCardId));
        dayCardEffects.reset$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ResetOneDayCardRejected', () => {
        const expectedResult = new DayCardActions.Reset.OneRejected();

        dayCardService.reset.and.returnValue(errorResponse);
        actions.next(new DayCardActions.Reset.One(dayCardId));
        dayCardEffects.reset$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a UpdateSlotsRejected when update of task schedule fails', () => {
        const expectedResult = new DayCardActions.Update.SlotsRejected(taskId);

        taskScheduleService.update.and.returnValue(errorResponse);
        actions.next(new DayCardActions.Update.Slots(updateSlotsPayload));
        dayCardEffects.updateSchedule$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a UpdateSlotsFulfilled when update of schedule is successful', () => {
        const expectedResult = new DayCardActions.Update.SlotsFulfilled(MOCK_TASK_SCHEDULE_RESOURCE_A);

        taskScheduleService.update.and.returnValue(updateOneWithScheduleResponse);
        actions.next(new DayCardActions.Update.Slots(updateSlotsPayload));
        dayCardEffects.updateSchedule$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should shift a day card to next position', () => {
        const currentStart = '2019-03-25';
        const currentEnd = '2019-04-07';
        const nextDayCardDate = moment(currentStart).add(1, 'd');
        const expectedResult: SaveTaskScheduleResource = new SaveTaskScheduleResource(currentStart, currentEnd, [
            new SaveTaskScheduleSlotResource(MOCK_SCHEDULE_ITEM_A.dayCard.id, nextDayCardDate),
        ]);
        const simpleUpdateSlotsPayload: UpdateSlotsPayload = {
            taskId,
            dayCardId,
            currentDate: nextDayCardDate,
        };
        const newTaskSchedule: TaskSchedule = {
            ...MOCK_TASK.schedule,
            slots: [
                {
                    dayCard: new ResourceReference(MOCK_DAY_CARD_RESOURCE_A.id, MOCK_DAY_CARD_RESOURCE_A.title),
                    date: currentStart,
                },
            ],
            start: currentStart,
            end: currentEnd,
        };

        taskScheduleByTaskIdSubject.next(newTaskSchedule);

        taskScheduleService.update.and.returnValue(updateOneWithScheduleResponse);
        actions.next(new DayCardActions.Update.Slots(simpleUpdateSlotsPayload));
        dayCardEffects.updateSchedule$.subscribe(() => {
            expect(taskScheduleService.update.calls.mostRecent().args)
                .toEqual([taskId, expectedResult, MOCK_TASK_SCHEDULE_RESOURCE_A.version]);
        });
    });

    it('should shift a day card to next position and push the ones in it\'s way also forward', () => {
        const currentStart = '2019-03-25';
        const currentEnd = '2019-04-07';
        const dayCardA = MOCK_DAY_CARD_RESOURCE_A;
        const dayCardB = MOCK_DAY_CARD_RESOURCE_B;
        const currentDayCardADate = '2019-03-25';
        const currentDayCardBDate = '2019-03-26';
        const nextDayCardADate = moment(currentDayCardADate).add(1, 'd');
        const nextDayCardBDate = moment(currentDayCardBDate).add(1, 'd');
        const expectedResult: SaveTaskScheduleResource = new SaveTaskScheduleResource(currentStart, currentEnd, [
            new SaveTaskScheduleSlotResource(dayCardA.id, nextDayCardADate),
            new SaveTaskScheduleSlotResource(dayCardB.id, nextDayCardBDate),
        ]);
        const cascadeUpdateSlotsPayload: UpdateSlotsPayload = {
            taskId,
            dayCardId: dayCardA.id,
            currentDate: nextDayCardADate,
        };
        const newTaskSchedule: TaskSchedule = {
            ...MOCK_TASK.schedule,
            slots: [
                {
                    dayCard: new ResourceReference(dayCardA.id, dayCardA.title),
                    date: currentDayCardADate,
                },
                {
                    dayCard: new ResourceReference(dayCardB.id, dayCardB.title),
                    date: currentDayCardBDate,
                },
            ],
            start: currentStart,
            end: currentEnd,
        };

        taskScheduleByTaskIdSubject.next(newTaskSchedule);

        taskScheduleService.update.and.returnValue(updateOneWithScheduleResponse);
        actions.next(new DayCardActions.Update.Slots(cascadeUpdateSlotsPayload));
        dayCardEffects.updateSchedule$.subscribe(() => {
            expect(taskScheduleService.update.calls.mostRecent().args)
                .toEqual([taskId, expectedResult, MOCK_TASK_SCHEDULE_RESOURCE_A.version]);
        });
    });

    it('should shift a day card to next position and leave in the same place ones that are not in it\'s way', () => {
        const currentStart = '2019-03-25';
        const currentEnd = '2019-04-07';
        const dayCardA = MOCK_DAY_CARD_RESOURCE_A;
        const dayCardB = MOCK_DAY_CARD_RESOURCE_B;
        const currentDayCardADate = '2019-03-25';
        const currentDayCardBDate = '2019-03-27';
        const nextDayCardADate = moment(currentDayCardADate).add(1, 'd');
        const nextDayCardBDate = moment(currentDayCardBDate);
        const expectedResult: SaveTaskScheduleResource = new SaveTaskScheduleResource(currentStart, currentEnd, [
            new SaveTaskScheduleSlotResource(dayCardA.id, nextDayCardADate),
            new SaveTaskScheduleSlotResource(dayCardB.id, nextDayCardBDate),
        ]);
        const simpleUpdateSlotsPayload: UpdateSlotsPayload = {
            taskId,
            dayCardId: dayCardA.id,
            currentDate: nextDayCardADate,
        };
        const newTaskSchedule: TaskSchedule = {
            ...MOCK_TASK.schedule,
            slots: [
                {
                    dayCard: new ResourceReference(dayCardA.id, dayCardA.title),
                    date: currentDayCardADate,
                },
                {
                    dayCard: new ResourceReference(dayCardB.id, dayCardB.title),
                    date: currentDayCardBDate,
                },
            ],
            start: currentStart,
            end: currentEnd,
        };

        taskScheduleByTaskIdSubject.next(newTaskSchedule);

        taskScheduleService.update.and.returnValue(updateOneWithScheduleResponse);
        actions.next(new DayCardActions.Update.Slots(simpleUpdateSlotsPayload));
        dayCardEffects.updateSchedule$.subscribe(() => {
            expect(taskScheduleService.update.calls.mostRecent().args)
                .toEqual([taskId, expectedResult, MOCK_TASK_SCHEDULE_RESOURCE_A.version]);
        });
    });

    it('should shift a day card to the position of an existing day card in the past and shift existing day card to the next ' +
        'available slot when day card that is being shifted is on a non-working day but it\'s possible to work on non-working days', () => {
        const workingDays: WeekDaysEnum[] = [WeekDaysEnum.MONDAY];
        const newWorkDays: WorkDaysResource = {...workDaysMock, workingDays, allowWorkOnNonWorkingDays: true};
        const dayCardA: DayCardResource = MOCK_DAY_CARD_RESOURCE_A;
        const dayCardB: DayCardResource = MOCK_DAY_CARD_RESOURCE_B;
        const newTaskScheduleStart = startOfWeekDate.format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const newTaskScheduleEnd = startOfWeekDate.clone().day(WeekDaysEnum.TUESDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const currentDayCardADate = startOfWeekDate.clone().day(WeekDaysEnum.MONDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const currentDayCardBDate = startOfWeekDate.clone().day(WeekDaysEnum.TUESDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const nextDayCardBDate: moment.Moment = moment(currentDayCardADate);
        const newTaskSchedule: TaskSchedule = {
            ...taskScheduleMock,
            slots: [
                {
                    dayCard: new ResourceReference(dayCardA.id, dayCardA.title),
                    date: currentDayCardADate,
                },
                {
                    dayCard: new ResourceReference(dayCardB.id, dayCardB.title),
                    date: currentDayCardBDate,
                },
            ],
            start: newTaskScheduleStart,
            end: newTaskScheduleEnd,
        };
        const newUpdatedSlotsPayload: UpdateSlotsPayload = {
            taskId,
            dayCardId: dayCardB.id,
            currentDate: nextDayCardBDate,
        };
        const expectedResult: SaveTaskScheduleResource = new SaveTaskScheduleResource(
            newTaskScheduleStart,
            newTaskScheduleEnd, [
                new SaveTaskScheduleSlotResource(dayCardA.id, moment(currentDayCardBDate)),
                new SaveTaskScheduleSlotResource(dayCardB.id, nextDayCardBDate),
            ]);

        workDaysSubject.next(newWorkDays);
        taskScheduleByTaskIdSubject.next(newTaskSchedule);
        taskScheduleService.update.and.returnValue(updateOneWithScheduleResponse);
        actions.next(new DayCardActions.Update.Slots(newUpdatedSlotsPayload));
        dayCardEffects.updateSchedule$.subscribe(() => {
            expect(taskScheduleService.update.calls.mostRecent().args)
                .toEqual([taskId, expectedResult, MOCK_TASK_SCHEDULE_RESOURCE_A.version]);
        });
    });

    it('should shift a day card to the position of an existing day card in the past and shift existing day card to the next available ' +
        'slot when day card that is being shifted is on a non-working day and it\'s not possible to work on non-working days', () => {
        const workingDays: WeekDaysEnum[] = [WeekDaysEnum.MONDAY, WeekDaysEnum.WEDNESDAY];
        const newWorkDays: WorkDaysResource = {...workDaysMock, workingDays, allowWorkOnNonWorkingDays: false};
        const dayCardA: DayCardResource = MOCK_DAY_CARD_RESOURCE_A;
        const dayCardB: DayCardResource = MOCK_DAY_CARD_RESOURCE_B;
        const newTaskScheduleStart = startOfWeekDate.format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const newTaskScheduleEnd = startOfWeekDate.clone().day(WeekDaysEnum.WEDNESDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const currentDayCardADate = startOfWeekDate.clone().day(WeekDaysEnum.MONDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const currentDayCardBDate = startOfWeekDate.clone().day(WeekDaysEnum.TUESDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const nextDayCardBDate: moment.Moment = moment(currentDayCardADate);
        const nextDayCardADate: moment.Moment = startOfWeekDate.clone().day(WeekDaysEnum.WEDNESDAY);
        const newTaskSchedule: TaskSchedule = {
            ...taskScheduleMock,
            slots: [
                {
                    dayCard: new ResourceReference(dayCardA.id, dayCardA.title),
                    date: currentDayCardADate,
                },
                {
                    dayCard: new ResourceReference(dayCardB.id, dayCardB.title),
                    date: currentDayCardBDate,
                },
            ],
            start: newTaskScheduleStart,
            end: newTaskScheduleEnd,
        };
        const newUpdatedSlotsPayload: UpdateSlotsPayload = {
            taskId,
            dayCardId: dayCardB.id,
            currentDate: nextDayCardBDate,
        };
        const expectedResult: SaveTaskScheduleResource = new SaveTaskScheduleResource(
            newTaskScheduleStart,
            newTaskScheduleEnd, [
                new SaveTaskScheduleSlotResource(dayCardA.id, nextDayCardADate),
                new SaveTaskScheduleSlotResource(dayCardB.id, nextDayCardBDate),
            ]);

        workDaysSubject.next(newWorkDays);
        taskScheduleByTaskIdSubject.next(newTaskSchedule);
        taskScheduleService.update.and.returnValue(updateOneWithScheduleResponse);
        actions.next(new DayCardActions.Update.Slots(newUpdatedSlotsPayload));
        dayCardEffects.updateSchedule$.subscribe(() => {
            expect(taskScheduleService.update.calls.mostRecent().args)
                .toEqual([taskId, expectedResult, MOCK_TASK_SCHEDULE_RESOURCE_A.version]);
        });
    });

    it('should shift a day card to the position of an existing day card in the past and shift existing day card to the next ' +
        'available slot when day card that is being shifted is on a holiday day but it\'s possible to work on non-working days', () => {
        const workingDays: WeekDaysEnum[] = fullWeekOfWorkingDays;
        const holidayDate = startOfWeekDate.clone().day(WeekDaysEnum.TUESDAY);
        const holidays: WorkDaysHoliday[] = [{name: 'foo', date: holidayDate.format(API_DATE_YEAR_MONTH_DAY_FORMAT)}];
        const newWorkDays: WorkDaysResource = {...workDaysMock, workingDays, holidays, allowWorkOnNonWorkingDays: true};
        const dayCardA: DayCardResource = MOCK_DAY_CARD_RESOURCE_A;
        const dayCardB: DayCardResource = MOCK_DAY_CARD_RESOURCE_B;
        const newTaskScheduleStart = startOfWeekDate.format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const newTaskScheduleEnd = startOfWeekDate.clone().day(WeekDaysEnum.TUESDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const currentDayCardADate = startOfWeekDate.clone().day(WeekDaysEnum.MONDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const currentDayCardBDate = holidayDate.format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const nextDayCardBDate: moment.Moment = moment(currentDayCardADate);
        const newTaskSchedule: TaskSchedule = {
            ...taskScheduleMock,
            slots: [
                {
                    dayCard: new ResourceReference(dayCardA.id, dayCardA.title),
                    date: currentDayCardADate,
                },
                {
                    dayCard: new ResourceReference(dayCardB.id, dayCardB.title),
                    date: currentDayCardBDate,
                },
            ],
            start: newTaskScheduleStart,
            end: newTaskScheduleEnd,
        };
        const newUpdatedSlotsPayload: UpdateSlotsPayload = {
            taskId,
            dayCardId: dayCardB.id,
            currentDate: nextDayCardBDate,
        };
        const expectedResult: SaveTaskScheduleResource = new SaveTaskScheduleResource(
            newTaskScheduleStart,
            newTaskScheduleEnd, [
                new SaveTaskScheduleSlotResource(dayCardA.id, moment(currentDayCardBDate)),
                new SaveTaskScheduleSlotResource(dayCardB.id, nextDayCardBDate),
            ]);

        workDaysSubject.next(newWorkDays);
        taskScheduleByTaskIdSubject.next(newTaskSchedule);
        taskScheduleService.update.and.returnValue(updateOneWithScheduleResponse);
        actions.next(new DayCardActions.Update.Slots(newUpdatedSlotsPayload));
        dayCardEffects.updateSchedule$.subscribe(() => {
            expect(taskScheduleService.update.calls.mostRecent().args)
                .toEqual([taskId, expectedResult, MOCK_TASK_SCHEDULE_RESOURCE_A.version]);
        });
    });

    it('should shift a day card to the position of an existing day card in the past and shift existing day card to the next available ' +
        'slot when day card that is being shifted is on a non-working day and it\'s not possible to work on non-working days', () => {
        const workingDays: WeekDaysEnum[] = fullWeekOfWorkingDays;
        const holidayDate = startOfWeekDate.clone().day(WeekDaysEnum.TUESDAY);
        const holidays: WorkDaysHoliday[] = [{name: 'foo', date: holidayDate.format(API_DATE_YEAR_MONTH_DAY_FORMAT)}];
        const newWorkDays: WorkDaysResource = {...workDaysMock, workingDays, holidays, allowWorkOnNonWorkingDays: false};
        const dayCardA: DayCardResource = MOCK_DAY_CARD_RESOURCE_A;
        const dayCardB: DayCardResource = MOCK_DAY_CARD_RESOURCE_B;
        const newTaskScheduleStart = startOfWeekDate.format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const newTaskScheduleEnd = startOfWeekDate.clone().day(WeekDaysEnum.WEDNESDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const currentDayCardADate = startOfWeekDate.clone().day(WeekDaysEnum.MONDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const currentDayCardBDate = holidayDate.format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const nextDayCardBDate: moment.Moment = moment(currentDayCardADate);
        const nextDayCardADate: moment.Moment = startOfWeekDate.clone().day(WeekDaysEnum.WEDNESDAY);
        const newTaskSchedule: TaskSchedule = {
            ...taskScheduleMock,
            slots: [
                {
                    dayCard: new ResourceReference(dayCardA.id, dayCardA.title),
                    date: currentDayCardADate,
                },
                {
                    dayCard: new ResourceReference(dayCardB.id, dayCardB.title),
                    date: currentDayCardBDate,
                },
            ],
            start: newTaskScheduleStart,
            end: newTaskScheduleEnd,
        };
        const newUpdatedSlotsPayload: UpdateSlotsPayload = {
            taskId,
            dayCardId: dayCardB.id,
            currentDate: nextDayCardBDate,
        };
        const expectedResult: SaveTaskScheduleResource = new SaveTaskScheduleResource(
            newTaskScheduleStart,
            newTaskScheduleEnd, [
                new SaveTaskScheduleSlotResource(dayCardA.id, nextDayCardADate),
                new SaveTaskScheduleSlotResource(dayCardB.id, nextDayCardBDate),
            ]);

        workDaysSubject.next(newWorkDays);
        taskScheduleByTaskIdSubject.next(newTaskSchedule);
        taskScheduleService.update.and.returnValue(updateOneWithScheduleResponse);
        actions.next(new DayCardActions.Update.Slots(newUpdatedSlotsPayload));
        dayCardEffects.updateSchedule$.subscribe(() => {
            expect(taskScheduleService.update.calls.mostRecent().args)
                .toEqual([taskId, expectedResult, MOCK_TASK_SCHEDULE_RESOURCE_A.version]);
        });
    });

    it('it should shift daycard and shift next daycards to the next available slots when there are ' +
        'locked slots of non-working days', () => {
        const workingDays: WeekDaysEnum[] = [WeekDaysEnum.MONDAY, WeekDaysEnum.TUESDAY, WeekDaysEnum.THURSDAY];
        const newWorkDays: WorkDaysResource = {...workDaysMock, allowWorkOnNonWorkingDays: false, workingDays};
        const dayCardA: DayCardResource = MOCK_DAY_CARD_RESOURCE_A;
        const dayCardB: DayCardResource = MOCK_DAY_CARD_RESOURCE_B;
        const newTaskScheduleStart = startOfWeekDate.format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const newTaskScheduleEnd = startOfWeekDate.clone().day(WeekDaysEnum.THURSDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const nextAvailableDay: moment.Moment = startOfWeekDate.clone().day(WeekDaysEnum.THURSDAY);
        const currentDayCardADate = startOfWeekDate.clone().day(WeekDaysEnum.MONDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const currentDayCardBDate = startOfWeekDate.clone().day(WeekDaysEnum.TUESDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const nextDayCardADate: moment.Moment = moment(currentDayCardBDate);
        const newTaskSchedule: TaskSchedule = {
            ...taskScheduleMock,
            slots: [
                {
                    dayCard: new ResourceReference(dayCardA.id, dayCardA.title),
                    date: currentDayCardADate,
                },
                {
                    dayCard: new ResourceReference(dayCardB.id, dayCardB.title),
                    date: currentDayCardBDate,
                },
            ],
            start: newTaskScheduleStart,
            end: newTaskScheduleEnd,
        };
        const newUpdatedSlotsPayload: UpdateSlotsPayload = {
            taskId,
            dayCardId,
            currentDate: nextDayCardADate,
        };
        const expectedResult: SaveTaskScheduleResource = new SaveTaskScheduleResource(
            newTaskScheduleStart,
            newTaskScheduleEnd, [
                new SaveTaskScheduleSlotResource(dayCardA.id, nextDayCardADate),
                new SaveTaskScheduleSlotResource(dayCardB.id, nextAvailableDay),
            ]);

        workDaysSubject.next(newWorkDays);
        taskScheduleByTaskIdSubject.next(newTaskSchedule);
        taskScheduleService.update.and.returnValue(updateOneWithScheduleResponse);
        actions.next(new DayCardActions.Update.Slots(newUpdatedSlotsPayload));
        dayCardEffects.updateSchedule$.subscribe(() => {
            expect(taskScheduleService.update.calls.mostRecent().args)
                .toEqual([taskId, expectedResult, MOCK_TASK_SCHEDULE_RESOURCE_A.version]);
        });
    });

    it('should shift daycard and shift next daycards to the next available slots even when there are ' +
        'daycards in locked slots of non-working days', () => {
        const workingDays: WeekDaysEnum[] = [WeekDaysEnum.MONDAY, WeekDaysEnum.TUESDAY, WeekDaysEnum.THURSDAY, WeekDaysEnum.FRIDAY];
        const newWorkDays: WorkDaysResource = {...workDaysMock, allowWorkOnNonWorkingDays: false, workingDays};
        const dayCardA: DayCardResource = MOCK_DAY_CARD_RESOURCE_A;
        const dayCardB: DayCardResource = MOCK_DAY_CARD_RESOURCE_B;
        const dayCardC: DayCardResource = {...MOCK_DAY_CARD_RESOURCE_B, id: 'foo'};
        const newTaskScheduleStart = startOfWeekDate.format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const newTaskScheduleEnd = startOfWeekDate.clone().day(WeekDaysEnum.FRIDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const nextAvailableDay: moment.Moment = startOfWeekDate.clone().day(WeekDaysEnum.THURSDAY);
        const currentDayCardADate = startOfWeekDate.clone().day(WeekDaysEnum.MONDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const currentDayCardBDate = startOfWeekDate.clone().day(WeekDaysEnum.TUESDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const currentDayCardCDate = startOfWeekDate.clone().day(WeekDaysEnum.WEDNESDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const nextDayCardADate: moment.Moment = moment(currentDayCardBDate);
        const newTaskScheduleSlotsDates: TaskSchedule = {
            ...taskScheduleMock,
            slots: [
                {
                    dayCard: new ResourceReference(dayCardA.id, dayCardA.title),
                    date: currentDayCardADate,
                },
                {
                    dayCard: new ResourceReference(dayCardB.id, dayCardB.title),
                    date: currentDayCardBDate,
                },
                {
                    dayCard: new ResourceReference(dayCardC.id, dayCardC.title),
                    date: currentDayCardCDate,
                },
            ],
            start: newTaskScheduleStart,
            end: newTaskScheduleEnd,
        };
        const newUpdatedSlotsPayload: UpdateSlotsPayload = {
            taskId,
            dayCardId,
            currentDate: nextDayCardADate,
        };
        const expectedResult: SaveTaskScheduleResource = new SaveTaskScheduleResource(
            newTaskScheduleStart,
            newTaskScheduleEnd, [
                new SaveTaskScheduleSlotResource(dayCardA.id, nextDayCardADate),
                new SaveTaskScheduleSlotResource(dayCardB.id, nextAvailableDay),
                new SaveTaskScheduleSlotResource(dayCardC.id, nextAvailableDay.clone().add(1, 'd')),
            ]);

        workDaysSubject.next(newWorkDays);
        taskScheduleByTaskIdSubject.next(newTaskScheduleSlotsDates);
        taskScheduleService.update.and.returnValue(updateOneWithScheduleResponse);
        actions.next(new DayCardActions.Update.Slots(newUpdatedSlotsPayload));
        dayCardEffects.updateSchedule$.subscribe(() => {
            expect(taskScheduleService.update.calls.mostRecent().args)
                .toEqual([taskId, expectedResult, MOCK_TASK_SCHEDULE_RESOURCE_A.version]);
        });
    });

    it('it should shift daycard and shift next daycards to the next available slots when there are ' +
        'locked slots of holidays', () => {
        const dayCardA: DayCardResource = MOCK_DAY_CARD_RESOURCE_A;
        const dayCardB: DayCardResource = MOCK_DAY_CARD_RESOURCE_B;
        const newTaskScheduleStart = startOfWeekDate.format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const newTaskScheduleEnd = startOfWeekDate.clone().day(WeekDaysEnum.THURSDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const nextAvailableDay: moment.Moment = startOfWeekDate.clone().day(WeekDaysEnum.THURSDAY);
        const currentDayCardADate = startOfWeekDate.clone().day(WeekDaysEnum.MONDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const currentDayCardBDate = startOfWeekDate.clone().day(WeekDaysEnum.TUESDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const nextDayCardADate: moment.Moment = moment(currentDayCardBDate);
        const workingDays: WeekDaysEnum[] = fullWeekOfWorkingDays;
        const holidays: WorkDaysHoliday[] =
            [{name: 'foo', date: startOfWeekDate.clone().day(WeekDaysEnum.WEDNESDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT)}];
        const newWorkDays: WorkDaysResource = {...workDaysMock, workingDays, holidays, allowWorkOnNonWorkingDays: false};
        const newTaskSchedule: TaskSchedule = {
            ...taskScheduleMock,
            slots: [
                {
                    dayCard: new ResourceReference(dayCardA.id, dayCardA.title),
                    date: currentDayCardADate,
                },
                {
                    dayCard: new ResourceReference(dayCardB.id, dayCardB.title),
                    date: currentDayCardBDate,
                },
            ],
            start: newTaskScheduleStart,
            end: newTaskScheduleEnd,
        };
        const newUpdatedSlotsPayload: UpdateSlotsPayload = {
            taskId,
            dayCardId,
            currentDate: nextDayCardADate,
        };
        const expectedResult: SaveTaskScheduleResource = new SaveTaskScheduleResource(
            newTaskScheduleStart,
            newTaskScheduleEnd, [
                new SaveTaskScheduleSlotResource(dayCardA.id, nextDayCardADate),
                new SaveTaskScheduleSlotResource(dayCardB.id, nextAvailableDay),
            ]);

        workDaysSubject.next(newWorkDays);
        taskScheduleByTaskIdSubject.next(newTaskSchedule);
        taskScheduleService.update.and.returnValue(updateOneWithScheduleResponse);
        actions.next(new DayCardActions.Update.Slots(newUpdatedSlotsPayload));
        dayCardEffects.updateSchedule$.subscribe(() => {
            expect(taskScheduleService.update.calls.mostRecent().args)
                .toEqual([taskId, expectedResult, MOCK_TASK_SCHEDULE_RESOURCE_A.version]);
        });
    });

    it('should shift daycard and shift next daycards to the next available slots even when there are ' +
        'daycards in locked slots of holidays', () => {
        const dayCardA: DayCardResource = MOCK_DAY_CARD_RESOURCE_A;
        const dayCardB: DayCardResource = MOCK_DAY_CARD_RESOURCE_B;
        const dayCardC: DayCardResource = {...MOCK_DAY_CARD_RESOURCE_B, id: 'foo'};
        const newTaskScheduleStart = startOfWeekDate.format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const newTaskScheduleEnd = startOfWeekDate.clone().day(WeekDaysEnum.FRIDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const nextAvailableDay: moment.Moment = startOfWeekDate.clone().day(WeekDaysEnum.THURSDAY);
        const currentDayCardADate = startOfWeekDate.clone().day(WeekDaysEnum.MONDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const currentDayCardBDate = startOfWeekDate.clone().day(WeekDaysEnum.TUESDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const currentDayCardCDate = startOfWeekDate.clone().day(WeekDaysEnum.WEDNESDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const nextDayCardADate: moment.Moment = moment(currentDayCardBDate);
        const workingDays: WeekDaysEnum[] = fullWeekOfWorkingDays;
        const holidays: WorkDaysHoliday[] =
            [{name: 'foo', date: startOfWeekDate.clone().day(WeekDaysEnum.WEDNESDAY).format(API_DATE_YEAR_MONTH_DAY_FORMAT)}];
        const newWorkDays: WorkDaysResource = {...workDaysMock, workingDays, holidays, allowWorkOnNonWorkingDays: false};
        const newTaskScheduleSlotsDates: TaskSchedule = {
            ...taskScheduleMock,
            slots: [
                {
                    dayCard: new ResourceReference(dayCardA.id, dayCardA.title),
                    date: currentDayCardADate,
                },
                {
                    dayCard: new ResourceReference(dayCardB.id, dayCardB.title),
                    date: currentDayCardBDate,
                },
                {
                    dayCard: new ResourceReference(dayCardC.id, dayCardC.title),
                    date: currentDayCardCDate,
                },
            ],
            start: newTaskScheduleStart,
            end: newTaskScheduleEnd,
        };
        const newUpdatedSlotsPayload: UpdateSlotsPayload = {
            taskId,
            dayCardId,
            currentDate: nextDayCardADate,
        };
        const expectedResult: SaveTaskScheduleResource = new SaveTaskScheduleResource(
            newTaskScheduleStart,
            newTaskScheduleEnd, [
                new SaveTaskScheduleSlotResource(dayCardA.id, nextDayCardADate),
                new SaveTaskScheduleSlotResource(dayCardB.id, nextAvailableDay),
                new SaveTaskScheduleSlotResource(dayCardC.id, nextAvailableDay.clone().add(1, 'd')),
            ]);

        workDaysSubject.next(newWorkDays);
        taskScheduleByTaskIdSubject.next(newTaskScheduleSlotsDates);
        taskScheduleService.update.and.returnValue(updateOneWithScheduleResponse);
        actions.next(new DayCardActions.Update.Slots(newUpdatedSlotsPayload));
        dayCardEffects.updateSchedule$.subscribe(() => {
            expect(taskScheduleService.update.calls.mostRecent().args)
                .toEqual([taskId, expectedResult, MOCK_TASK_SCHEDULE_RESOURCE_A.version]);
        });
    });

    it('should trigger a RequestAllDayCard when a event from an updated day card is received', fakeAsync(() => {
        let currentResult: Action;
        const expectedResult = new DayCardActions.Request.All(dayCardIds);
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const object =
            new ObjectIdentifierPairWithVersion(ObjectTypeEnum.DayCard, MOCK_DAY_CARD_RESOURCE_A.id, MOCK_DAY_CARD_RESOURCE_A.version + 1);
        const event: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.Updated, root, object);

        disposableSubscription = dayCardEffects.dayCardUpdateEvents$.subscribe(result => currentResult = result);

        context.next(root);
        updates.next(event);

        tick(DAY_CARD_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
    }));

    it('should not trigger a RequestOneDayCard when a event from an updated day card is received but version ' +
        'is the same', fakeAsync(() => {
        let currentResult: Action = null;
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const object: ObjectIdentifierPairWithVersion =
            new ObjectIdentifierPairWithVersion(ObjectTypeEnum.DayCard, MOCK_DAY_CARD_RESOURCE_A.id, MOCK_DAY_CARD_RESOURCE_A.version);
        const event: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.Updated, root, object);

        disposableSubscription = dayCardEffects.dayCardUpdateEvents$.subscribe(result => currentResult = result);

        context.next(root);
        updates.next(event);

        tick(DAY_CARD_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toBeNull();
    }));

    it('should not trigger a RequestOneDayCard when a event from an updated day card is received but context' +
        ' is different', fakeAsync(() => {
        let currentResult: Action = null;
        const currentContext: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_2.id);
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const object =
            new ObjectIdentifierPairWithVersion(ObjectTypeEnum.DayCard, MOCK_DAY_CARD_RESOURCE_A.id, MOCK_DAY_CARD_RESOURCE_A.version + 1);
        const event: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.Updated, root, object);

        disposableSubscription = dayCardEffects.dayCardUpdateEvents$.subscribe(result => currentResult = result);

        context.next(currentContext);
        updates.next(event);

        tick(DAY_CARD_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toBeNull();
    }));

    it('should not trigger a RequestOneDayCard when a event from an updated day card is received ' +
        'but day card does not exist in the store', fakeAsync(() => {
        let currentResult: Action = null;
        const nonStoredDaycardId = 'b8763b19-de8e-ea0d-2d6f-d77feb70a496';
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const object: ObjectIdentifierPairWithVersion = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.DayCard, nonStoredDaycardId, 1);
        const event: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.Updated, root, object);

        disposableSubscription = dayCardEffects.dayCardUpdateEvents$.subscribe(result => currentResult = result);

        when(dayCardQueriesMock.observeDayCardById(nonStoredDaycardId)).thenReturn(new Subject());

        context.next(root);
        updates.next(event);

        tick(DAY_CARD_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toBeNull();
    }));

    it('should not trigger a RequestOneDayCard when a event from an created day card is received', fakeAsync(() => {
        let currentResult: Action = null;
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const object =
            new ObjectIdentifierPairWithVersion(ObjectTypeEnum.DayCard, MOCK_DAY_CARD_RESOURCE_A.id, MOCK_DAY_CARD_RESOURCE_A.version + 1);
        const event: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.Created, root, object);

        disposableSubscription = dayCardEffects.dayCardUpdateEvents$.subscribe(result => currentResult = result);

        context.next(root);
        updates.next(event);

        tick(DAY_CARD_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toBeNull();
    }));

    it('should trigger a ApproveAllDayCardFulfilled', () => {
        const expectedResult = new DayCardActions.Approve.AllFulfilled(dayCardListMock);

        dayCardService.approveAll.and.returnValue(of(dayCardListMock));
        actions.next(new DayCardActions.Approve.All(dayCardIds));
        dayCardEffects.approveAll$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ApproveAllDayCardRejected', () => {
        const expectedResult = new DayCardActions.Approve.AllRejected(dayCardIds);

        dayCardService.approveAll.and.returnValue(errorResponse);
        actions.next(new DayCardActions.Approve.All(dayCardIds));
        dayCardEffects.approveAll$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a CancelAllDayCardFulfilled', () => {
        const expectedResult = new DayCardActions.Cancel.AllFulfilled(dayCardListMock);

        dayCardService.cancelAll.and.returnValue(of(dayCardListMock));
        actions.next(new DayCardActions.Cancel.All(cancelAllPayload));
        dayCardEffects.cancelAll$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a CancelAllDayCardRejected', () => {
        const expectedResult = new DayCardActions.Cancel.AllRejected();

        dayCardService.cancelAll.and.returnValue(errorResponse);
        actions.next(new DayCardActions.Cancel.All(cancelAllPayload));
        dayCardEffects.cancelAll$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a CompleteAllDayCardFulfilled', () => {
        const expectedResult = new DayCardActions.Complete.AllFulfilled(dayCardListMock);

        dayCardService.completeAll.and.returnValue(of(dayCardListMock));
        actions.next(new DayCardActions.Complete.All(dayCardIds));
        dayCardEffects.completeAll$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a CompleteAllDayCardRejected', () => {
        const expectedResult = new DayCardActions.Complete.AllRejected();

        dayCardService.completeAll.and.returnValue(errorResponse);
        actions.next(new DayCardActions.Complete.All(dayCardIds));
        dayCardEffects.completeAll$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger an DeleteAllDayCardFulfilled action when deleting daycards', () => {
        const results = [];
        const abstractItemSchedule = new AbstractItemsResource([taskScheduleResourceMock, taskScheduleResourceMock2]);
        const expectedResult = [new DayCardActions.Delete.AllFulfilled(abstractItemSchedule.items)];
        const saveDeleteItems1 = new SaveDeleteDayCardResource(taskScheduleResourceMock.version, [dayCardResourceMock.id]);
        const saveDeleteItem2 = new SaveDeleteDayCardResource(taskScheduleResourceMock2.version, [dayCardResourceMock3.id]);
        const abstractItems = new AbstractItemsResource([saveDeleteItem2, saveDeleteItems1]);

        dayCardService.deleteAll.and.returnValue(of(abstractItemSchedule));
        actions.next(new DayCardActions.Delete.All(deleteAllPayloadFromDifferentTasks));
        dayCardEffects.deleteAll$.subscribe(result => results.push(result));

        expect(dayCardService.deleteAll).toHaveBeenCalledWith(MOCK_PROJECT_1.id, abstractItems);
        expect(results).toEqual(expectedResult);
    });

    it('should trigger an DeleteAllDayCardRejected action when deleting daycards failed', () => {
        const results = [];
        const expectedResult = [new DayCardActions.Delete.AllRejected()];

        dayCardService.deleteAll.and.returnValue(errorResponse);
        actions.next(new DayCardActions.Delete.All(deleteAllPayloadFromSameTask));
        dayCardEffects.deleteAll$.subscribe(result => results.push(result));

        expect(results).toEqual(expectedResult);
    });

    it('should trigger a RequestAllFulfilled', () => {
        const expectedResult = new DayCardActions.Request.AllFulfilled(dayCardListFromSameTask);

        dayCardService.findAll.and.returnValue(of(dayCardListFromSameTask));
        actions.next(new DayCardActions.Request.All(dayCardIdsFromSameTask));
        dayCardEffects.requestAllDayCard$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a RequestAllRejected', () => {
        const expectedResult = new DayCardActions.Request.AllRejected();

        dayCardService.findAll.and.returnValue(errorResponse);
        actions.next(new DayCardActions.Request.All(dayCardIdsFromSameTask));
        dayCardEffects.requestAllDayCard$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a AlertActionAddAlert upon DeleteAllDayCardFulfilled action', () => {
        const schedule = [MOCK_TASK_SCHEDULE_RESOURCE_A];
        const expectedResult = new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('DayCards_Delete_SuccessMessage')});

        actions.next(new DayCardActions.Delete.AllFulfilled(schedule));
        dayCardEffects.deleteAllSuccess$.subscribe((result: AlertActions.Add.SuccessAlert) => {
            expect(result.payload.type).toEqual(expectedResult.payload.type);
            expect(result.payload.message).toEqual(expectedResult.payload.message);
        });
    });

    it('should buffer day card update events and filter repeated day card ids', fakeAsync(() => {
        let currentResult: Action;
        const dayCardIdsUpdateEvents = [MOCK_DAY_CARD_RESOURCE_A.id, MOCK_DAY_CARD_RESOURCE_B.id];
        const expectedResult = new DayCardActions.Request.All(dayCardIdsUpdateEvents);
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const dayCardObject1 =
            new ObjectIdentifierPairWithVersion(ObjectTypeEnum.DayCard, MOCK_DAY_CARD_RESOURCE_A.id, MOCK_DAY_CARD_RESOURCE_A.version + 1);
        const dayCardObject2 =
            new ObjectIdentifierPairWithVersion(ObjectTypeEnum.DayCard, MOCK_DAY_CARD_RESOURCE_B.id, MOCK_DAY_CARD_RESOURCE_A.version + 1);
        const dayCardEvent1: RealtimeEventUpdateDataResource =
            new RealtimeEventUpdateDataResource(EventTypeEnum.Updated, root, dayCardObject1);
        const dayCardEvent2: RealtimeEventUpdateDataResource =
            new RealtimeEventUpdateDataResource(EventTypeEnum.Updated, root, dayCardObject2);

        disposableSubscription = dayCardEffects.dayCardUpdateEvents$.subscribe((result: DayCardActions.Request.All) => {
            currentResult = result;
        });

        when(dayCardQueriesMock.observeDayCardById(MOCK_DAY_CARD_B.id)).thenReturn(of(MOCK_DAY_CARD_B));

        context.next(root);
        updates.next(dayCardEvent1);
        updates.next(dayCardEvent1);
        updates.next(dayCardEvent1);
        updates.next(dayCardEvent2);
        updates.next(dayCardEvent2);
        updates.next(dayCardEvent2);

        tick(DAY_CARD_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
    }));

    it('should debounce day card update events', fakeAsync(() => {
        const results: Action[] = [];
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const object =
            new ObjectIdentifierPairWithVersion(ObjectTypeEnum.DayCard, MOCK_DAY_CARD_RESOURCE_A.id, MOCK_DAY_CARD_RESOURCE_A.version + 1);
        const event: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.Updated, root, object);
        const expectedResult = [
            new DayCardActions.Request.All(dayCardIds),
            new DayCardActions.Request.All(dayCardIds),
        ];

        disposableSubscription = dayCardEffects.dayCardUpdateEvents$.subscribe((result: DayCardActions.Request.All) => {
            results.push(result);
        });

        context.next(root);
        updates.next(event);
        updates.next(event);
        updates.next(event);
        updates.next(event);
        updates.next(event);

        tick(DAY_CARD_UPDATE_EVENTS_DEBOUNCE_TIME);

        updates.next(event);
        updates.next(event);
        updates.next(event);
        updates.next(event);
        updates.next(event);

        tick((DAY_CARD_UPDATE_EVENTS_DEBOUNCE_TIME * 2) + 50);

        expect(results).toEqual(expectedResult);
    }));

    it('should fetch all day cards in chunks of 100', () => {
        const dayCardIdsList = new Array(150).fill(dayCardId);
        const expectedResult = new DayCardActions.Request.AllFulfilled([MOCK_DAY_CARD_RESOURCE_A, MOCK_DAY_CARD_RESOURCE_A]);
        const expectedAmountOfChunks = Math.ceil(dayCardIdsList.length / 100);

        dayCardService.findAll.and.returnValue(of([MOCK_TASK_SCHEDULE_RESOURCE_A]));
        actions.next(new DayCardActions.Request.AllFromTasks(dayCardIdsList));
        dayCardEffects.requestAllDayCard$.subscribe(result => {
            expect(dayCardService.findAll).toHaveBeenCalledTimes(expectedAmountOfChunks);
            expect(result).toEqual(expectedResult);
        });
    });

    it('should dispatch CalendarSelectionActions.Initialize.All action after ' +
        'DayCardActions.Approve.AllFulfilled is dispatched', (done) => {
        const expectedAction = new CalendarSelectionActions.Initialize.All();

        actions.next(new DayCardActions.Approve.AllFulfilled(dayCardListFromSameTask));

        dayCardEffects.resetCalendarSelection$.subscribe(action => {
            expect(action).toEqual(expectedAction);
            done();
        });
    });

    it('should dispatch CalendarSelectionActions.Initialize.All action after ' +
        'DayCardActions.Complete.AllFulfilled is dispatched', (done) => {
        const expectedAction = new CalendarSelectionActions.Initialize.All();

        actions.next(new DayCardActions.Complete.AllFulfilled(dayCardListFromSameTask));

        dayCardEffects.resetCalendarSelection$.subscribe(action => {
            expect(action).toEqual(expectedAction);
            done();
        });
    });

    it('should dispatch CalendarSelectionActions.Initialize.All action after ' +
        'DayCardActions.Cancel.AllFulfilled is dispatched', (done) => {
        const expectedAction = new CalendarSelectionActions.Initialize.All();

        actions.next(new DayCardActions.Cancel.AllFulfilled(dayCardListFromSameTask));

        dayCardEffects.resetCalendarSelection$.subscribe(action => {
            expect(action).toEqual(expectedAction);
            done();
        });
    });

    it('should dispatch CalendarSelectionActions.Initialize.All action after ' +
        'DayCardActions.Delete.AllFulfilled is dispatched', (done) => {
        const expectedAction = new CalendarSelectionActions.Initialize.All();

        actions.next(new DayCardActions.Delete.AllFulfilled([taskScheduleResourceMock]));

        dayCardEffects.resetCalendarSelection$.subscribe(action => {
            expect(action).toEqual(expectedAction);
            done();
        });
    });

    it('should trigger a CalendarSelectionActions.Set.Items action with the selected items except the two deleted daycards when ' +
        'two events from deleted daycards are received and the deleted daycards were selected', fakeAsync(() => {
        let currentResult: Action = null;
        const selectedItems = [
            new ObjectIdentifierPair(ObjectTypeEnum.DayCard, 'A'),
            new ObjectIdentifierPair(ObjectTypeEnum.DayCard, 'B'),
            new ObjectIdentifierPair(ObjectTypeEnum.DayCard, 'C'),
        ];
        const notDeletedSelectedItems = [
            new ObjectIdentifierPair(ObjectTypeEnum.DayCard, 'C'),
        ];
        const expectedResult = new CalendarSelectionActions.Set.Items(notDeletedSelectedItems);
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const objectA = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.DayCard, 'A', 1);
        const objectB = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.DayCard, 'B', 1);
        const eventA: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.Deleted, root, objectA);
        const eventB: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.Deleted, root, objectB);

        disposableSubscription = dayCardEffects.dayCardDeleteEvents$.subscribe(result => currentResult = result);

        calendarSelectionItemsSubject.next(selectedItems);
        context.next(root);
        updates.next(eventA);
        updates.next(eventB);

        tick(DAY_CARD_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
    }));

    it('should trigger a CalendarSelectionActions.Set.Items action with the selected items except one deleted daycard when ' +
        'two events from deleted daycards are received but just one of them was selected', fakeAsync(() => {
        let currentResult: Action = null;
        const selectedItems = [
            new ObjectIdentifierPair(ObjectTypeEnum.DayCard, 'A'),
            new ObjectIdentifierPair(ObjectTypeEnum.DayCard, 'B'),
            new ObjectIdentifierPair(ObjectTypeEnum.DayCard, 'C'),
        ];
        const notDeletedSelectedItems = [
            new ObjectIdentifierPair(ObjectTypeEnum.DayCard, 'B'),
            new ObjectIdentifierPair(ObjectTypeEnum.DayCard, 'C'),
        ];
        const expectedResult = new CalendarSelectionActions.Set.Items(notDeletedSelectedItems);
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const objectA = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.DayCard, 'A', 1);
        const objectD = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.DayCard, 'D', 1);
        const eventA: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.Deleted, root, objectA);
        const eventD: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.Deleted, root, objectD);

        disposableSubscription = dayCardEffects.dayCardDeleteEvents$.subscribe(result => currentResult = result);

        calendarSelectionItemsSubject.next(selectedItems);
        context.next(root);
        updates.next(eventA);
        updates.next(eventD);

        tick(DAY_CARD_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
    }));

    it('should not trigger a CalendarSelectionActions.Set.Items action when two events from deleted ' +
        'daycards are received but none of them were selected', fakeAsync(() => {
        let currentResult: Action = null;
        const selectedItems = [];
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const objectA = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.DayCard, 'A', 1);
        const objectD = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.DayCard, 'D', 1);
        const eventA: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.Deleted, root, objectA);
        const eventD: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.Deleted, root, objectD);

        disposableSubscription = dayCardEffects.dayCardDeleteEvents$.subscribe(result => currentResult = result);

        calendarSelectionItemsSubject.next(selectedItems);
        context.next(root);
        updates.next(eventA);
        updates.next(eventD);

        tick(DAY_CARD_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toBeNull();
    }));

    it('should trigger two CalendarSelectionActions.Set.Items actions when two events from deleted ' +
        'daycards are received, the deleted daycards were selected but the events were received in a time interval greater than ' +
        DAY_CARD_UPDATE_EVENTS_DEBOUNCE_TIME + 'ms', fakeAsync(() => {
        const currentResult: Action[] = [];
        const selectedItems = [
            new ObjectIdentifierPair(ObjectTypeEnum.DayCard, 'A'),
            new ObjectIdentifierPair(ObjectTypeEnum.DayCard, 'B'),
            new ObjectIdentifierPair(ObjectTypeEnum.DayCard, 'C'),
        ];
        const notDeletedSelectedItems1 = [
            new ObjectIdentifierPair(ObjectTypeEnum.DayCard, 'B'),
            new ObjectIdentifierPair(ObjectTypeEnum.DayCard, 'C'),
        ];
        const notDeletedSelectedItems2 = [
            new ObjectIdentifierPair(ObjectTypeEnum.DayCard, 'C'),
        ];
        const expectedResult = [
            new CalendarSelectionActions.Set.Items(notDeletedSelectedItems1),
            new CalendarSelectionActions.Set.Items(notDeletedSelectedItems2),
        ];
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const objectA = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.DayCard, 'A', 1);
        const objectB = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.DayCard, 'B', 1);
        const eventA = new RealtimeEventUpdateDataResource(EventTypeEnum.Deleted, root, objectA);
        const eventB = new RealtimeEventUpdateDataResource(EventTypeEnum.Deleted, root, objectB);

        disposableSubscription = dayCardEffects.dayCardDeleteEvents$.subscribe(result => currentResult.push(result));

        calendarSelectionItemsSubject.next(selectedItems);
        context.next(root);
        updates.next(eventA);

        tick(DAY_CARD_UPDATE_EVENTS_DEBOUNCE_TIME);
        calendarSelectionItemsSubject.next(notDeletedSelectedItems1);
        updates.next(eventB);

        tick(DAY_CARD_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
    }));
});
