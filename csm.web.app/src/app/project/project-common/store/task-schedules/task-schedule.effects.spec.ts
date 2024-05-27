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
    Observable,
    of,
    ReplaySubject,
    Subject,
    Subscription,
    throwError
} from 'rxjs';
import {
    deepEqual,
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_PROJECT_1,
    MOCK_PROJECT_2
} from '../../../../../test/mocks/projects';
import {MockStore} from '../../../../../test/mocks/store';
import {
    MOCK_TASK_SCHEDULE_ENTITY_A,
    MOCK_TASK_SCHEDULE_ENTITY_B,
    MOCK_TASK_SCHEDULE_RESOURCE_A,
    MOCK_TASK_SCHEDULE_RESOURCE_B,
} from '../../../../../test/mocks/task-schedules';
import {
    MOCK_TASK_RESOURCE,
    MOCK_TASK_RESOURCE_2,
    MOCK_TASK_RESOURCE_WITHOUT_SCHEDULE
} from '../../../../../test/mocks/tasks';
import {RealtimeQueriesStub} from '../../../../../test/stubs/realtime-queries.stub';
import {RealtimeServiceStub} from '../../../../../test/stubs/realtime-service.stub';
import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectIdentifierPairWithVersion} from '../../../../shared/misc/api/datatypes/object-identifier-pair-with-version.datatype';
import {TimeScope} from '../../../../shared/misc/api/datatypes/time-scope.datatype';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RealtimeService} from '../../../../shared/realtime/api/realtime.service';
import {RealtimeEventUpdateDataResource} from '../../../../shared/realtime/api/resources/realtime-event-update-data.resource';
import {EventTypeEnum} from '../../../../shared/realtime/enums/event-type.enum';
import {RealtimeQueries} from '../../../../shared/realtime/store/realtime.queries';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../shared/rest/constants/date-format.constant';
import {TaskScheduleService} from '../../api/task-schedueles/task-schedule.service';
import {ProjectTaskListResource} from '../../api/tasks/resources/task-list.resource';
import {TaskScheduleResource} from '../../api/tasks/resources/task-schedule.resource';
import {CalendarScopeQueries} from '../calendar/calendar-scope/calendar-scope.queries';
import {DayCardActions} from '../day-cards/day-card.actions';
import {NewsActions} from '../news/news.actions';
import {ProjectTaskActions} from '../tasks/task.actions';
import {
    TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME,
    TaskScheduleEffects
} from './task-schedule.effects';

describe('Task Schedule Effects', () => {
    let actions: ReplaySubject<any>;
    let taskScheduleEffects: TaskScheduleEffects;
    let disposableSubscription: Subscription = new Subscription();

    const calendarScopeQueriesMock: CalendarScopeQueries = mock(CalendarScopeQueries);
    const taskScheduleServiceMock: TaskScheduleService = mock(TaskScheduleService);
    const calendarScopeSubject = new ReplaySubject<TimeScope>(1);
    const context: ReplaySubject<ObjectIdentifierPair> = new ReplaySubject(1);
    const updates: ReplaySubject<RealtimeEventUpdateDataResource> = new Subject() as ReplaySubject<RealtimeEventUpdateDataResource>;
    const nonStoredTaskScheduleId = 'foo';
    const errorResponse: Observable<any> = throwError('error');
    const rootProject: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);

    const getTaskScheduleUpdateEvent = (id: string, version: number, root = rootProject): RealtimeEventUpdateDataResource => {
        const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.TaskSchedule, id, version);

        return new RealtimeEventUpdateDataResource(EventTypeEnum.Updated, root, object);
    };

    const getTimeScopeWithDateInside = (date: string): TimeScope => {
        const start = moment(date).subtract(1, 'w').format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const end = moment(date).add(1, 'w').format(API_DATE_YEAR_MONTH_DAY_FORMAT);

        return new TimeScope(start, end);
    };
    const getTimeScopeWithDateOutside = (date: string): TimeScope => {
        const start = moment(date).add(2, 'w').format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const end = moment(date).add(3, 'w').format(API_DATE_YEAR_MONTH_DAY_FORMAT);

        return new TimeScope(start, end);
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            TaskScheduleEffects,
            provideMockActions(() => actions),
            {
                provide: CalendarScopeQueries,
                useValue: instance(calendarScopeQueriesMock),
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
                useValue: new MockStore({
                    projectModule: {
                        taskScheduleSlice: {
                            items: [
                                MOCK_TASK_SCHEDULE_ENTITY_A,
                                MOCK_TASK_SCHEDULE_ENTITY_B,
                            ],
                        },
                    },
                }),
            },
            {
                provide: TaskScheduleService,
                useFactory: () => instance(taskScheduleServiceMock),
            },
        ],
    };

    when(calendarScopeQueriesMock.observeCalendarScope()).thenReturn(calendarScopeSubject);

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        actions = new ReplaySubject(1);
        taskScheduleEffects = TestBed.inject(TaskScheduleEffects);
    });

    afterEach(() => {
        disposableSubscription.unsubscribe();
    });

    it('should trigger a DayCardActions.Request.AllFromTasks action when ProjectTaskActions.Request.CalendarTasksFulfilled ' +
        'action is trigger', () => {
        const action: ProjectTaskListResource = {
            tasks: [MOCK_TASK_RESOURCE, MOCK_TASK_RESOURCE_2],
            pageNumber: 0,
            pageSize: 10,
            totalElements: 2,
            totalPages: 1,
            _links: {
                self: {
                    href: '',
                },
            },
        };

        let currentResult: Action = null;
        const expectedResult = new DayCardActions.Request.AllFromTasks([MOCK_TASK_RESOURCE.id, MOCK_TASK_RESOURCE_2.id]);

        actions.next(new ProjectTaskActions.Request.AllCalendarFulfilled(action));
        taskScheduleEffects.requestCalendarTasks$.subscribe(result => currentResult = result);

        expect(currentResult).toEqual(expectedResult);
    });

    it('should not trigger a DayCardActions.Request.AllFromTasks action when ProjectTaskActions.Request.CalendarTasksFulfilled ' +
        'action is trigger with no tasks', () => {
        const action: ProjectTaskListResource = {
            tasks: [],
            pageNumber: 0,
            pageSize: 10,
            totalElements: 0,
            totalPages: 0,
            _links: {
                self: {
                    href: '',
                },
            },
        };

        let currentResult: Action = null;
        const expectedResult = {
            type: 'EMPTY_ACTION',
        };

        actions.next(new ProjectTaskActions.Request.AllCalendarFulfilled(action));
        taskScheduleEffects.requestCalendarTasks$.subscribe(result => currentResult = result);

        expect(currentResult).toEqual(expectedResult);
    });

    it('should trigger a ProjectTaskActions.Request.TaskScheduleByTaskId action after requesting current task with schedule', () => {
        const expectedResult = new DayCardActions.Request.AllByTask(MOCK_TASK_RESOURCE.id);

        actions.next(new ProjectTaskActions.Request.OneFulfilled(MOCK_TASK_RESOURCE));
        taskScheduleEffects.requestScheduleByTaskFulfilled$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should not trigger a ProjectTaskActions.Request.TaskScheduleByTaskId action after requesting current task without schedule', () => {
        const expectedResult = new DayCardActions.Request.AllByTask(null);

        actions.next(new ProjectTaskActions.Request.OneFulfilled(MOCK_TASK_RESOURCE_WITHOUT_SCHEDULE));
        taskScheduleEffects.requestScheduleByTaskFulfilled$.subscribe(result => {
            expect(result).not.toEqual(expectedResult);
        });
    });

    it('should trigger a DayCardActions.Request.AllFromTasks action when a task schedule update event is received for a task ' +
        'schedule that is on the store, the version is outdated and its inside the calendar scope', fakeAsync(() => {
        const {id, version, start, task: {id: taskId}} = MOCK_TASK_SCHEDULE_RESOURCE_A;
        const event = getTaskScheduleUpdateEvent(id, version + 1);
        const calendarScope = getTimeScopeWithDateInside(start);
        const expectedResult = new DayCardActions.Request.AllFromTasks([taskId]);
        let currentResult: Action = null;

        disposableSubscription = taskScheduleEffects.dayCardsListUpdateEvents$.subscribe(result => currentResult = result);

        calendarScopeSubject.next(calendarScope);
        context.next(rootProject);
        updates.next(event);

        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
    }));

    it('should not trigger a DayCardActions.Request.AllFromTasks action when a task schedule update event is received for a schedule' +
        ' that is on the store, the version is outdated, its inside the calendar scope but the context is different', fakeAsync(() => {
        const {id, version, start, task: {id: taskId}} = MOCK_TASK_SCHEDULE_RESOURCE_A;
        const root = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_2.id);
        const event = getTaskScheduleUpdateEvent(id, version + 1, root);
        const calendarScope = getTimeScopeWithDateInside(start);
        const expectedResult = new DayCardActions.Request.AllFromTasks([taskId]);
        let currentResult: Action = null;

        disposableSubscription = taskScheduleEffects.dayCardsListUpdateEvents$.subscribe(result => currentResult = result);

        calendarScopeSubject.next(calendarScope);
        context.next(root);
        updates.next(event);

        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
    }));

    it('should not trigger a DayCardActions.Request.AllFromTasks action when a task schedule update event is received for a task ' +
        'schedule that is not on the store', fakeAsync(() => {
        const event = getTaskScheduleUpdateEvent(nonStoredTaskScheduleId, 1);
        let currentResult: Action = null;

        disposableSubscription = taskScheduleEffects.dayCardsListUpdateEvents$.subscribe(result => currentResult = result);

        context.next(rootProject);
        updates.next(event);

        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toBeNull();
    }));

    it('should not trigger a DayCardActions.Request.AllFromTasks action when a task schedule update event is received for a task ' +
        'schedule that is on the store but the version is up to date', fakeAsync(() => {
        const {id, version} = MOCK_TASK_SCHEDULE_RESOURCE_A;
        const event = getTaskScheduleUpdateEvent(id, version);
        let currentResult: Action = null;

        disposableSubscription = taskScheduleEffects.dayCardsListUpdateEvents$.subscribe(result => currentResult = result);

        context.next(rootProject);
        updates.next(event);

        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toBeNull();
    }));

    it('should not trigger a DayCardActions.Request.AllFromTasks action when a task schedule update event is received for a task ' +
        'schedule that is on the store, the version is outdated but it isn\'t inside the calendar scope', fakeAsync(() => {
        const {id, version, end} = MOCK_TASK_SCHEDULE_RESOURCE_A;
        const event = getTaskScheduleUpdateEvent(id, version + 1);
        const calendarScope = getTimeScopeWithDateOutside(end);
        let currentResult: Action = null;

        disposableSubscription = taskScheduleEffects.dayCardsListUpdateEvents$.subscribe(result => currentResult = result);

        calendarScopeSubject.next(calendarScope);
        context.next(rootProject);
        updates.next(event);

        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toBeNull();
    }));

    it(`should buffer the task schedule update events and trigger a DayCardActions.Request.AllFromTasks when they match the
     required criteria and they are received in a period of ${TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME}ms`, fakeAsync(() => {
        const {id: idA, start, version: versionA, task: {id: taskIdA}} = MOCK_TASK_SCHEDULE_RESOURCE_A;
        const {id: idB, version: versionB, task: {id: taskIdB}} = MOCK_TASK_SCHEDULE_RESOURCE_B;
        const eventA = getTaskScheduleUpdateEvent(idA, versionA + 1);
        const eventB = getTaskScheduleUpdateEvent(idB, versionB + 1);
        const calendarScope = getTimeScopeWithDateInside(start);
        const expectedResult = new DayCardActions.Request.AllFromTasks([taskIdA, taskIdB]);
        let currentResult: Action = null;

        disposableSubscription = taskScheduleEffects.dayCardsListUpdateEvents$.subscribe(result => currentResult = result);

        calendarScopeSubject.next(calendarScope);
        context.next(rootProject);
        updates.next(eventA);
        updates.next(eventB);

        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
    }));

    it(`should not buffer the task schedule update events and trigger a DayCardActions.Request.AllFromTasks when they match the
    required criteria but they are received with a time gap of ${TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME}ms`, fakeAsync(() => {
        const {id: idA, start, version: versionA, task: {id: taskIdA}} = MOCK_TASK_SCHEDULE_RESOURCE_A;
        const {id: idB, version: versionB, task: {id: taskIdB}} = MOCK_TASK_SCHEDULE_RESOURCE_B;
        const eventA = getTaskScheduleUpdateEvent(idA, versionA + 1);
        const eventB = getTaskScheduleUpdateEvent(idB, versionB + 1);
        const calendarScope = getTimeScopeWithDateInside(start);
        const currentResult: Action[] = [];
        const expectedResult = [
            new DayCardActions.Request.AllFromTasks([taskIdA]),
            new DayCardActions.Request.AllFromTasks([taskIdB]),
        ];

        disposableSubscription = taskScheduleEffects.dayCardsListUpdateEvents$.subscribe(result => currentResult.push(result));

        calendarScopeSubject.next(calendarScope);
        context.next(rootProject);
        updates.next(eventA);
        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);
        updates.next(eventB);
        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
    }));

    it('should trigger a ProjectTaskActions.Request.AllCalendar action when a task schedule update event is received for a task ' +
        'schedule that is on the store, the version is outdated, the stored version is outside the calendar scope but the updated ' +
        'version is inside the calendar scope', fakeAsync(() => {
        const {id, version} = MOCK_TASK_SCHEDULE_RESOURCE_A;
        const taskScheduleInsideScope: TaskScheduleResource = {
            ...MOCK_TASK_SCHEDULE_RESOURCE_A,
            start: moment().format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            end: moment().add(1, 'w').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
        };
        const event = getTaskScheduleUpdateEvent(id, version + 1);
        const calendarScope = getTimeScopeWithDateInside(taskScheduleInsideScope.end);
        const expectedResult = new ProjectTaskActions.Request.AllCalendar();
        let currentResult: Action = null;

        disposableSubscription = taskScheduleEffects.taskScheduleUpdateEventsForNonExistingStoreSchedules$
            .subscribe(result => currentResult = result);

        when(taskScheduleServiceMock.findAllByIds(deepEqual([id]))).thenReturn(of([taskScheduleInsideScope]));

        calendarScopeSubject.next(calendarScope);
        context.next(rootProject);
        updates.next(event);

        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
    }));

    it('should trigger a ProjectTaskActions.Request.AllCalendar action when a task schedule update event is received for a task ' +
        'schedule that is not on the store, and the updated version is inside the calendar scope', fakeAsync(() => {
        const taskScheduleInsideScope: TaskScheduleResource = {
            ...MOCK_TASK_SCHEDULE_RESOURCE_A,
            start: moment().format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            end: moment().add(1, 'w').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
        };
        const event = getTaskScheduleUpdateEvent(nonStoredTaskScheduleId, 1);
        const calendarScope = getTimeScopeWithDateInside(taskScheduleInsideScope.end);
        const expectedResult = new ProjectTaskActions.Request.AllCalendar();
        let currentResult: Action = null;

        disposableSubscription = taskScheduleEffects.taskScheduleUpdateEventsForNonExistingStoreSchedules$
            .subscribe(result => currentResult = result);

        when(taskScheduleServiceMock.findAllByIds(deepEqual([nonStoredTaskScheduleId]))).thenReturn(of([taskScheduleInsideScope]));

        calendarScopeSubject.next(calendarScope);
        context.next(rootProject);
        updates.next(event);

        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
    }));

    it('should not trigger a ProjectTaskActions.Request.AllCalendar action when a task schedule update event is received for a task ' +
        'schedule that is not on the store and the updated version is outside the calendar scope', fakeAsync(() => {
        const taskScheduleOutsideScope: TaskScheduleResource = {
            ...MOCK_TASK_SCHEDULE_RESOURCE_A,
            start: moment().format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            end: moment().add(1, 'w').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
        };
        const event = getTaskScheduleUpdateEvent(nonStoredTaskScheduleId, 1);
        const calendarScope = getTimeScopeWithDateOutside(taskScheduleOutsideScope.start);
        let currentResult: Action = null;

        disposableSubscription = taskScheduleEffects.taskScheduleUpdateEventsForNonExistingStoreSchedules$
            .subscribe(result => currentResult = result);

        when(taskScheduleServiceMock.findAllByIds(deepEqual([nonStoredTaskScheduleId]))).thenReturn(of([taskScheduleOutsideScope]));

        calendarScopeSubject.next(calendarScope);
        context.next(rootProject);
        updates.next(event);

        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toBeNull();
    }));

    it('should not trigger a ProjectTaskActions.Request.AllCalendar action when a task schedule update event is received for a task ' +
        'schedule that is on the store, the version is outdated, but the stored version is inside of the calendar scope', fakeAsync(() => {
        const {id, version, start} = MOCK_TASK_SCHEDULE_RESOURCE_A;
        const event = getTaskScheduleUpdateEvent(id, version + 1);
        const calendarScope = getTimeScopeWithDateInside(start);
        let currentResult: Action = null;

        disposableSubscription = taskScheduleEffects.taskScheduleUpdateEventsForNonExistingStoreSchedules$
            .subscribe(result => currentResult = result);

        calendarScopeSubject.next(calendarScope);
        context.next(rootProject);
        updates.next(event);

        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toBeNull();
    }));

    it('should not trigger a ProjectTaskActions.Request.AllCalendar action when a task schedule update event is received for a task ' +
        'schedule that is on the store, the version is outdated, the stored version is outside the calendar scope and the updated version' +
        'is also outside of the calendar scope', fakeAsync(() => {
        const {id, version, start} = MOCK_TASK_SCHEDULE_RESOURCE_A;
        const event = getTaskScheduleUpdateEvent(id, version + 1);
        const calendarScope = getTimeScopeWithDateOutside(start);
        let currentResult: Action = null;

        disposableSubscription = taskScheduleEffects.taskScheduleUpdateEventsForNonExistingStoreSchedules$
            .subscribe(result => currentResult = result);

        when(taskScheduleServiceMock.findAllByIds(deepEqual([id]))).thenReturn(of([MOCK_TASK_SCHEDULE_RESOURCE_A]));

        calendarScopeSubject.next(calendarScope);
        context.next(rootProject);
        updates.next(event);

        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toBeNull();
    }));

    it('should not trigger a ProjectTaskActions.Request.AllCalendar action when a task schedule update event is received for a task ' +
        'schedule that is not on the store and the request for task schedule is unsuccessful', fakeAsync(() => {
        const event = getTaskScheduleUpdateEvent(nonStoredTaskScheduleId, 1);
        let currentResult: Action = null;

        when(taskScheduleServiceMock.findAllByIds([nonStoredTaskScheduleId])).thenReturn(errorResponse);

        taskScheduleEffects.taskScheduleUpdateEventsForNonExistingStoreSchedules$.subscribe(result => currentResult = result);

        context.next(rootProject);
        updates.next(event);

        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toBeNull();
    }));

    it(`should buffer the task schedule update events and trigger a ProjectTaskActions.Request.AllCalendar when they match the
    required criteria and they are received in a period of ${TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME}ms`, fakeAsync(() => {
        const nonStoredTaskScheduleIdB = 'bar';
        const eventA = getTaskScheduleUpdateEvent(nonStoredTaskScheduleId, 1);
        const eventB = getTaskScheduleUpdateEvent(nonStoredTaskScheduleIdB, 1);
        const calendarScope = getTimeScopeWithDateInside(MOCK_TASK_SCHEDULE_RESOURCE_A.start);
        const expectedResult = new ProjectTaskActions.Request.AllCalendar();
        let currentResult: Action = null;

        disposableSubscription = taskScheduleEffects.taskScheduleUpdateEventsForNonExistingStoreSchedules$
            .subscribe(result => currentResult = result);

        when(taskScheduleServiceMock.findAllByIds(deepEqual([nonStoredTaskScheduleId, nonStoredTaskScheduleIdB])))
            .thenReturn(of([MOCK_TASK_SCHEDULE_RESOURCE_A, MOCK_TASK_SCHEDULE_RESOURCE_B]));

        calendarScopeSubject.next(calendarScope);
        context.next(rootProject);
        updates.next(eventA);
        updates.next(eventB);

        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
    }));

    it(`should not buffer the task schedule update events and trigger a ProjectTaskActions.Request.AllCalendar when they match the
    required criteria but they are received with a time gap of ${TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME}ms`, fakeAsync(() => {
        const nonStoredTaskScheduleIdB = 'bar';
        const eventA = getTaskScheduleUpdateEvent(nonStoredTaskScheduleId, 1);
        const eventB = getTaskScheduleUpdateEvent(nonStoredTaskScheduleIdB, 1);
        const calendarScope = getTimeScopeWithDateInside(MOCK_TASK_SCHEDULE_RESOURCE_A.start);
        const expectedResult = [
            new ProjectTaskActions.Request.AllCalendar(),
            new ProjectTaskActions.Request.AllCalendar(),
        ];
        const currentResult: Action[] = [];

        disposableSubscription = taskScheduleEffects.taskScheduleUpdateEventsForNonExistingStoreSchedules$
            .subscribe(result => currentResult.push(result));

        when(taskScheduleServiceMock.findAllByIds(deepEqual([nonStoredTaskScheduleId]))).thenReturn(of([MOCK_TASK_SCHEDULE_RESOURCE_A]));
        when(taskScheduleServiceMock.findAllByIds(deepEqual([nonStoredTaskScheduleIdB]))).thenReturn(of([MOCK_TASK_SCHEDULE_RESOURCE_B]));

        calendarScopeSubject.next(calendarScope);
        context.next(rootProject);
        updates.next(eventA);
        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);
        updates.next(eventB);
        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
    }));

    it('should trigger a NewsActions.Request.AllNews action when a task schedule update event is received for a task ' +
        'schedule that is on the store, the version is outdated and its inside the calendar scope', fakeAsync(() => {
        const {id, version, start, task: {id: taskId}} = MOCK_TASK_SCHEDULE_RESOURCE_A;
        const event = getTaskScheduleUpdateEvent(id, version + 1);
        const calendarScope = getTimeScopeWithDateInside(start);
        const expectedResult = new NewsActions.Request.AllNews([new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId)]);
        let currentResult: Action = null;

        disposableSubscription = taskScheduleEffects.newsUpdateEvents$.subscribe(result => currentResult = result);

        calendarScopeSubject.next(calendarScope);
        context.next(rootProject);
        updates.next(event);

        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
    }));

    it('should not trigger a NewsActions.Request.AllNews action when a task schedule update event is received for a schedule' +
        ' that is on the store, the version is outdated, its inside the calendar scope but the context is different', fakeAsync(() => {
        const {id, version, start, task: {id: taskId}} = MOCK_TASK_SCHEDULE_RESOURCE_A;
        const root = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_2.id);
        const event = getTaskScheduleUpdateEvent(id, version + 1, root);
        const calendarScope = getTimeScopeWithDateInside(start);
        const expectedResult = new NewsActions.Request.AllNews([new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId)]);
        let currentResult: Action = null;

        disposableSubscription = taskScheduleEffects.newsUpdateEvents$.subscribe(result => currentResult = result);

        calendarScopeSubject.next(calendarScope);
        context.next(root);
        updates.next(event);

        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
    }));

    it('should not trigger a NewsActions.Request.AllNews action when a task schedule update event is received for a task ' +
        'schedule that is not on the store', fakeAsync(() => {
        const event = getTaskScheduleUpdateEvent(nonStoredTaskScheduleId, 1);
        let currentResult: Action = null;

        disposableSubscription = taskScheduleEffects.newsUpdateEvents$.subscribe(result => currentResult = result);

        context.next(rootProject);
        updates.next(event);

        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toBeNull();
    }));

    it('should not trigger a NewsActions.Request.AllNews action when a task schedule update event is received for a task ' +
        'schedule that is on the store but the version is up to date', fakeAsync(() => {
        const {id, version} = MOCK_TASK_SCHEDULE_RESOURCE_A;
        const event = getTaskScheduleUpdateEvent(id, version);
        let currentResult: Action = null;

        disposableSubscription = taskScheduleEffects.newsUpdateEvents$.subscribe(result => currentResult = result);

        context.next(rootProject);
        updates.next(event);

        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toBeNull();
    }));

    it('should not trigger a NewsActions.Request.AllNews action when a task schedule update event is received for a task ' +
        'schedule that is on the store, the version is outdated but it isn\'t inside the calendar scope', fakeAsync(() => {
        const {id, version, end} = MOCK_TASK_SCHEDULE_RESOURCE_A;
        const event = getTaskScheduleUpdateEvent(id, version + 1);
        const calendarScope = getTimeScopeWithDateOutside(end);
        let currentResult: Action = null;

        disposableSubscription = taskScheduleEffects.newsUpdateEvents$.subscribe(result => currentResult = result);

        calendarScopeSubject.next(calendarScope);
        context.next(rootProject);
        updates.next(event);

        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toBeNull();
    }));

    it(`should buffer the task schedule update events and trigger a NewsActions.Request.AllNews when they match the
     required criteria and they are received in a period of ${TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME}ms`, fakeAsync(() => {
        const {id: idA, start, version: versionA, task: {id: taskIdA}} = MOCK_TASK_SCHEDULE_RESOURCE_A;
        const {id: idB, version: versionB, task: {id: taskIdB}} = MOCK_TASK_SCHEDULE_RESOURCE_B;
        const eventA = getTaskScheduleUpdateEvent(idA, versionA + 1);
        const eventB = getTaskScheduleUpdateEvent(idB, versionB + 1);
        const calendarScope = getTimeScopeWithDateInside(start);
        const expectedResult = new NewsActions.Request.AllNews([
            new ObjectIdentifierPair(ObjectTypeEnum.Task, taskIdA),
            new ObjectIdentifierPair(ObjectTypeEnum.Task, taskIdB),
        ]);
        let currentResult: Action = null;

        disposableSubscription = taskScheduleEffects.newsUpdateEvents$.subscribe(result => currentResult = result);

        calendarScopeSubject.next(calendarScope);
        context.next(rootProject);
        updates.next(eventA);
        updates.next(eventB);

        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
    }));

    it(`should not buffer the task schedule update events and trigger a NewsActions.Request.AllNews when they match the
    required criteria but they are received with a time gap of ${TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME}ms`, fakeAsync(() => {
        const {id: idA, start, version: versionA, task: {id: taskIdA}} = MOCK_TASK_SCHEDULE_RESOURCE_A;
        const {id: idB, version: versionB, task: {id: taskIdB}} = MOCK_TASK_SCHEDULE_RESOURCE_B;
        const eventA = getTaskScheduleUpdateEvent(idA, versionA + 1);
        const eventB = getTaskScheduleUpdateEvent(idB, versionB + 1);
        const calendarScope = getTimeScopeWithDateInside(start);
        const currentResult: Action[] = [];
        const expectedResult = [
            new NewsActions.Request.AllNews([new ObjectIdentifierPair(ObjectTypeEnum.Task, taskIdA)]),
            new NewsActions.Request.AllNews([new ObjectIdentifierPair(ObjectTypeEnum.Task, taskIdB)]),
        ];

        disposableSubscription = taskScheduleEffects.newsUpdateEvents$.subscribe(result => currentResult.push(result));

        calendarScopeSubject.next(calendarScope);
        context.next(rootProject);
        updates.next(eventA);
        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);
        updates.next(eventB);
        tick(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
    }));
});
