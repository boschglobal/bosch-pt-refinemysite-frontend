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
import {
    ActivatedRoute,
    ParamMap,
    Router,
} from '@angular/router';
import {provideMockActions} from '@ngrx/effects/testing';
import {Action} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';
import {
    BehaviorSubject,
    Observable,
    of,
    ReplaySubject,
    throwError,
} from 'rxjs';
import {
    take,
    toArray,
} from 'rxjs/operators';
import {
    anything,
    instance,
    mock,
    when,
} from 'ts-mockito';

import {
    MOCK_DAY_CARD_A,
    MOCK_DAY_CARD_RESOURCE_A,
} from '../../../../../../test/mocks/day-cards';
import {
    MOCK_MILESTONE_CRAFT,
    MOCK_MILESTONE_HEADER,
    MOCK_MILESTONE_RESOURCE_HEADER,
} from '../../../../../../test/mocks/milestones';
import {
    MOCK_TASK_SCHEDULE_B,
    MOCK_TASK_SCHEDULE_RESOURCE_A,
    MOCK_TASK_SCHEDULE_RESOURCE_B,
} from '../../../../../../test/mocks/task-schedules';
import {MOCK_TASK_2} from '../../../../../../test/mocks/tasks';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {ObjectIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {TimeScope} from '../../../../../shared/misc/api/datatypes/time-scope.datatype';
import {ObjectTypeEnum} from '../../../../../shared/misc/enums/object-type.enum';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../../shared/rest/constants/date-format.constant';
import {MOMENT_YEAR_MONTH_DAY_FORMAT} from '../../../../../shared/ui/dates/date.helper.service';
import {DateParserStrategy} from '../../../../../shared/ui/dates/date-parser.strategy';
import {PROJECT_ROUTE_PATHS} from '../../../../project-routing/project-route.paths';
import {DayCardService} from '../../../api/day-cards/day-card.service';
import {MilestoneService} from '../../../api/milestones/milestone.service';
import {TaskScheduleService} from '../../../api/task-schedueles/task-schedule.service';
import {ProjectTaskListResource} from '../../../api/tasks/resources/task-list.resource';
import {TasksCalendarModeEnum} from '../../../enums/tasks-calendar-mode.enum';
import {ProjectDateParserStrategy} from '../../../helpers/project-date-parser.strategy';
import {
    TASKS_CALENDAR_URL_QUERY_PARAMS_EXPANDED_WEEKS_SEPARATOR,
    TasksCalendarUrlQueryParamsEnum,
} from '../../../helpers/tasks-calendar-url-query-params.helper';
import {TasksCalendarFocusParams} from '../../../models/tasks-calendar-focus-params/tasks-calendar-focus-params';
import {DayCardActions} from '../../day-cards/day-card.actions';
import {MilestoneActions} from '../../milestones/milestone.actions';
import {MilestoneQueries} from '../../milestones/milestone.queries';
import {TaskScheduleQueries} from '../../task-schedules/task-schedule.queries';
import {ProjectTaskActions} from '../../tasks/task.actions';
import {CalendarScopeParameters} from '../slice/calendar.scope-parameters';
import {CalendarScopeActions} from './calendar-scope.actions';
import {
    CalendarScopeEffects,
    TASKS_CALENDAR_DEFAULT_MODE,
} from './calendar-scope.effects';
import {CalendarScopeQueries} from './calendar-scope.queries';

describe('Calendar Scope Effects', () => {
    let actions: ReplaySubject<any>;
    let calendarScopeEffects: CalendarScopeEffects;
    let queryParamMap$: ReplaySubject<ParamMap>;

    const activatedRouteMock = mock(ActivatedRoute);
    const dateParserStrategyMock = mock(ProjectDateParserStrategy);
    const dayCardServiceMock = mock(DayCardService);
    const calendarScopeQueriesMock = mock(CalendarScopeQueries);
    const milestoneServiceMock = mock(MilestoneService);
    const milestoneQueriesMock = mock(MilestoneQueries);
    const routerMock = mock(Router);

    const taskScheduleQueriesMock = mock(TaskScheduleQueries);
    const taskScheduleServiceMock = mock(TaskScheduleService);

    const currentWeekMoment = moment().startOf('week');
    const currentWeek = currentWeekMoment.format(MOMENT_YEAR_MONTH_DAY_FORMAT);
    const calendarScope: TimeScope = {start: currentWeekMoment, end: currentWeekMoment.clone().add(6, 'w')};
    const calendarScope$ = new BehaviorSubject<TimeScope>(calendarScope);
    const calendarScopeParameters: CalendarScopeParameters = {start: currentWeekMoment, mode: TasksCalendarModeEnum.SixWeeks};
    const calendarScopeParameters$ = new BehaviorSubject<CalendarScopeParameters>(calendarScopeParameters);
    const expandedWeeks$ = new BehaviorSubject<moment.Moment[]>([]);
    const focus$ = new BehaviorSubject<ObjectIdentifierPair>(null);
    const errorResponse: Observable<any> = throwError('error');
    const nonExistingFocusDefaultActions: Action[] = [
        new CalendarScopeActions.Set.Start(currentWeekMoment),
        new CalendarScopeActions.Set.Mode(TASKS_CALENDAR_DEFAULT_MODE),
        new CalendarScopeActions.Resolve.FocusFulfilled(null),
    ];

    const createParamMap = (params: URLSearchParams): ParamMap => {
        const keys = [];

        params.forEach((value, key) => keys.push(key));

        return Object.assign(params, {keys});
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            provideMockActions(() => actions),
            CalendarScopeEffects,
            {
                provide: ActivatedRoute,
                useValue: instance(activatedRouteMock),
            },
            {
                provide: CalendarScopeQueries,
                useValue: instance(calendarScopeQueriesMock),
            },
            {
                provide: DateParserStrategy,
                useValue: instance(dateParserStrategyMock),
            },
            {
                provide: DayCardService,
                useValue: instance(dayCardServiceMock),
            },
            {
                provide: MilestoneService,
                useValue: instance(milestoneServiceMock),
            },
            {
                provide: MilestoneQueries,
                useValue: instance(milestoneQueriesMock),
            },
            {
                provide: Router,
                useValue: instance(routerMock),
            },
            {
                provide: TaskScheduleQueries,
                useValue: instance(taskScheduleQueriesMock),
            },
            {
                provide: TaskScheduleService,
                useValue: instance(taskScheduleServiceMock),
            },
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        queryParamMap$ = new ReplaySubject<ParamMap>(1);
        focus$.next(null);
        expandedWeeks$.next([]);
        calendarScope$.next(calendarScope);
        calendarScopeParameters$.next(calendarScopeParameters);

        when(activatedRouteMock.queryParamMap).thenReturn(queryParamMap$);
        when(calendarScopeQueriesMock.observeCalendarScope()).thenReturn(calendarScope$);
        when(calendarScopeQueriesMock.observeCalendarScopeParameters()).thenReturn(calendarScopeParameters$);
        when(dateParserStrategyMock.startOfWeek()).thenReturn(currentWeekMoment);
        when(routerMock.url).thenReturn(PROJECT_ROUTE_PATHS.calendar);
        when(calendarScopeQueriesMock.observeExpandedWeeks()).thenReturn(expandedWeeks$);
        when(calendarScopeQueriesMock.observeFocus()).thenReturn(focus$);

        calendarScopeEffects = TestBed.inject(CalendarScopeEffects);

        actions = new ReplaySubject(1);
    });

    it('should not trigger a CalendarScopeActions.Set.Start action when current URL does not have calendar route', () => {
        let currentResult: Action = null;
        const newStartMoment = currentWeekMoment.clone().add('1', 'w');
        const newStart = newStartMoment.format(MOMENT_YEAR_MONTH_DAY_FORMAT);
        const startQueryParam = {[TasksCalendarUrlQueryParamsEnum.Start]: newStart};
        const params = createParamMap(new URLSearchParams(startQueryParam));

        when(routerMock.url).thenReturn('foo');

        queryParamMap$.next(params);
        calendarScopeEffects.queryParamsStartChange$.subscribe(result => currentResult = result);

        expect(currentResult).toBeNull();
    });

    it('should not trigger a CalendarScopeActions.Set.Start action when URL query parameters do not have start', () => {
        let currentResult: Action = null;
        const params = createParamMap(new URLSearchParams({}));

        queryParamMap$.next(params);
        calendarScopeEffects.queryParamsStartChange$.subscribe(result => currentResult = result);

        expect(currentResult).toBeNull();
    });

    it('should not trigger a CalendarScopeActions.Set.Start action when start query parameter is same has the ' +
        'one currently in store', () => {
        let currentResult: Action = null;
        const startQueryParam = {[TasksCalendarUrlQueryParamsEnum.Start]: currentWeek};
        const params = createParamMap(new URLSearchParams(startQueryParam));

        when(dateParserStrategyMock.startOfWeek(anything())).thenReturn(currentWeekMoment);

        queryParamMap$.next(params);
        calendarScopeEffects.queryParamsStartChange$.subscribe(result => currentResult = result);

        expect(currentResult).toBeNull();
    });

    it('should not trigger a CalendarScopeActions.Set.Start action when start query parameter is invalid', () => {
        let currentResult: Action = null;
        const startQueryParam = {[TasksCalendarUrlQueryParamsEnum.Start]: 'foo'};
        const params = createParamMap(new URLSearchParams(startQueryParam));

        when(dateParserStrategyMock.startOfWeek(anything())).thenReturn(moment('foo'));

        queryParamMap$.next(params);
        calendarScopeEffects.queryParamsStartChange$.subscribe(result => currentResult = result);

        expect(currentResult).toBeNull();
    });

    it('should not trigger a CalendarScopeActions.Set.Start action when focus query parameter is set', () => {
        let currentResult: Action = null;
        const newStartMoment = currentWeekMoment.clone().add('1', 'w');
        const newStart = newStartMoment.format(MOMENT_YEAR_MONTH_DAY_FORMAT);
        const startQueryParam = {[TasksCalendarUrlQueryParamsEnum.Start]: newStart};
        const focusQueryParam = {[TasksCalendarUrlQueryParamsEnum.Focus]: 'foo'};
        const params = createParamMap(new URLSearchParams({...startQueryParam, ...focusQueryParam}));

        queryParamMap$.next(params);
        calendarScopeEffects.queryParamsStartChange$.subscribe(result => currentResult = result);

        expect(currentResult).toBeNull();
    });

    it('should trigger a CalendarScopeActions.Set.Start action when start query parameter is valid and ' +
        'different then the one currently in store', () => {
        let currentResult: CalendarScopeActions.Set.Start = null;
        const newStartMoment = currentWeekMoment.clone().add('1', 'w');
        const newStart = newStartMoment.format(MOMENT_YEAR_MONTH_DAY_FORMAT);
        const startQueryParam = {[TasksCalendarUrlQueryParamsEnum.Start]: newStart};
        const params = createParamMap(new URLSearchParams(startQueryParam));
        const expectedResult = new CalendarScopeActions.Set.Start(newStartMoment);

        when(dateParserStrategyMock.startOfWeek(anything())).thenReturn(newStartMoment);

        queryParamMap$.next(params);
        calendarScopeEffects.queryParamsStartChange$.subscribe((result: CalendarScopeActions.Set.Start) => currentResult = result);

        expect(currentResult).toBeDefined();
        expect(currentResult.type).toEqual(expectedResult.type);
        expect(currentResult.payload.isSame(expectedResult.payload, 'd')).toBeTruthy();
    });

    it('should not trigger a CalendarScopeActions.Set.Mode action when current URL does not have calendar route', () => {
        let currentResult: Action = null;
        const newMode = TasksCalendarModeEnum.EighteenWeeks;
        const modeQueryParam = {[TasksCalendarUrlQueryParamsEnum.Mode]: newMode};
        const params = createParamMap(new URLSearchParams(modeQueryParam));

        when(routerMock.url).thenReturn('foo');

        queryParamMap$.next(params);
        calendarScopeEffects.queryParamsModeChange$.subscribe(result => currentResult = result);

        expect(currentResult).toBeNull();
    });

    it('should not trigger a CalendarScopeActions.Set.Mode action when URL query parameters do not have mode', () => {
        let currentResult: Action = null;
        const params = createParamMap(new URLSearchParams());

        queryParamMap$.next(params);
        calendarScopeEffects.queryParamsModeChange$.subscribe(result => currentResult = result);

        expect(currentResult).toBeNull();
    });

    it('should not trigger a CalendarScopeActions.Set.Mode action when mode query parameter is same has the one currently in store', () => {
        let currentResult: Action = null;
        const newMode = TasksCalendarModeEnum.SixWeeks;
        const modeQueryParam = {[TasksCalendarUrlQueryParamsEnum.Mode]: newMode};
        const params = createParamMap(new URLSearchParams(modeQueryParam));

        queryParamMap$.next(params);
        calendarScopeEffects.queryParamsModeChange$.subscribe(result => currentResult = result);

        expect(currentResult).toBeNull();
    });

    it('should not trigger a CalendarScopeActions.Set.Mode action when mode query parameter is invalid', () => {
        let currentResult: Action = null;
        const modeQueryParam = {[TasksCalendarUrlQueryParamsEnum.Mode]: 'foo' as TasksCalendarModeEnum};
        const params = createParamMap(new URLSearchParams(modeQueryParam));

        queryParamMap$.next(params);
        calendarScopeEffects.queryParamsModeChange$.subscribe(result => currentResult = result);

        expect(currentResult).toBeNull();
    });

    it('should not trigger a CalendarScopeActions.Set.Mode action when focus query parameter is set', () => {
        let currentResult: Action = null;
        const newMode = TasksCalendarModeEnum.EighteenWeeks;
        const modeQueryParam = {[TasksCalendarUrlQueryParamsEnum.Mode]: newMode};
        const focusQueryParam = {[TasksCalendarUrlQueryParamsEnum.Focus]: 'foo'};
        const params = createParamMap(new URLSearchParams({...modeQueryParam, ...focusQueryParam}));

        queryParamMap$.next(params);
        calendarScopeEffects.queryParamsModeChange$.subscribe(result => currentResult = result);

        expect(currentResult).toBeNull();
    });

    it('should trigger a CalendarScopeActions.Set.Mode action when mode query parameter is valid and ' +
        'different then the one currently in store', () => {
        let currentResult: Action = null;
        const newMode = TasksCalendarModeEnum.EighteenWeeks;
        const modeQueryParam = {[TasksCalendarUrlQueryParamsEnum.Mode]: newMode};
        const params = createParamMap(new URLSearchParams(modeQueryParam));
        const expectedAction = new CalendarScopeActions.Set.Mode(newMode);

        queryParamMap$.next(params);
        calendarScopeEffects.queryParamsModeChange$.subscribe(result => currentResult = result);

        expect(currentResult).toEqual(expectedAction);
    });

    it('should not trigger a CalendarScopeActions.Set.ExpandedWeeks action when current URL does not have calendar route', () => {
        let currentResult: CalendarScopeActions.Set.ExpandedWeeks = null;
        const expandedWeeks = [currentWeekMoment];
        const expandedWeeksEncoded = expandedWeeks
            .map(week => week.format(MOMENT_YEAR_MONTH_DAY_FORMAT))
            .join(TASKS_CALENDAR_URL_QUERY_PARAMS_EXPANDED_WEEKS_SEPARATOR);
        const expandedWeeksParam = {[TasksCalendarUrlQueryParamsEnum.Expanded]: expandedWeeksEncoded};
        const params = createParamMap(new URLSearchParams(expandedWeeksParam));

        when(routerMock.url).thenReturn('foo');

        queryParamMap$.next(params);
        calendarScopeEffects.queryParamsExpandedWeeksChange$
            .subscribe((result: CalendarScopeActions.Set.ExpandedWeeks) => currentResult = result);

        expect(currentResult).toBeNull();
    });

    it('should not trigger a CalendarScopeActions.Set.ExpandedWeeks action when URL query parameters do not have expanded weeks', () => {
        let currentResult: Action = null;
        const params = createParamMap(new URLSearchParams());

        queryParamMap$.next(params);
        calendarScopeEffects.queryParamsExpandedWeeksChange$.subscribe(result => currentResult = result);

        expect(currentResult).toBeNull();
    });

    it('should not trigger a CalendarScopeActions.Set.ExpandedWeeks action when expanded weeks query parameter is same has ' +
        'the one currently in store', () => {
        let currentResult = null;
        const expandedWeeks = [currentWeekMoment];
        const expandedWeeksEncoded = expandedWeeks
            .map(week => week.format(MOMENT_YEAR_MONTH_DAY_FORMAT))
            .join(TASKS_CALENDAR_URL_QUERY_PARAMS_EXPANDED_WEEKS_SEPARATOR);
        const expandedWeeksParam = {[TasksCalendarUrlQueryParamsEnum.Expanded]: expandedWeeksEncoded};
        const params = createParamMap(new URLSearchParams(expandedWeeksParam));

        expandedWeeks$.next(expandedWeeks);
        queryParamMap$.next(params);
        calendarScopeEffects.queryParamsExpandedWeeksChange$
            .subscribe((result: CalendarScopeActions.Set.ExpandedWeeks) => currentResult = result);

        expect(currentResult).toBeNull();
    });

    it('should not trigger a CalendarScopeActions.Set.ExpandedWeeks action when expanded weeks query parameter is invalid', () => {
        let currentResult: CalendarScopeActions.Set.ExpandedWeeks = null;
        const expandedWeeksParam = {[TasksCalendarUrlQueryParamsEnum.Expanded]: 'foo'};
        const params = createParamMap(new URLSearchParams(expandedWeeksParam));

        queryParamMap$.next(params);
        calendarScopeEffects.queryParamsExpandedWeeksChange$
            .subscribe((result: CalendarScopeActions.Set.ExpandedWeeks) => currentResult = result);

        expect(currentResult).toBeNull();
    });

    it('should trigger a CalendarScopeActions.Set.ExpandedWeeks action when expanded weeks query parameter has week ' +
        'not currently in store', () => {
        let currentResult: CalendarScopeActions.Set.ExpandedWeeks = null;
        const expandedWeeks = [currentWeekMoment];
        const expandedWeeksEncoded = expandedWeeks
            .map(week => week.format(MOMENT_YEAR_MONTH_DAY_FORMAT))
            .join(TASKS_CALENDAR_URL_QUERY_PARAMS_EXPANDED_WEEKS_SEPARATOR);
        const expandedWeeksParam = {[TasksCalendarUrlQueryParamsEnum.Expanded]: expandedWeeksEncoded};
        const params = createParamMap(new URLSearchParams(expandedWeeksParam));
        const expectedAction = new CalendarScopeActions.Set.ExpandedWeeks(expandedWeeks);

        queryParamMap$.next(params);
        calendarScopeEffects.queryParamsExpandedWeeksChange$
            .subscribe((result: CalendarScopeActions.Set.ExpandedWeeks) => currentResult = result);

        expect(currentResult).toBeDefined();
        expect(currentResult.payload.length).toEqual(expectedAction.payload.length);
        currentResult.payload.forEach(week => expectedAction.payload.some(expectedWeek => week.isSame(expectedWeek, 'd')));
    });

    it('should trigger a CalendarScopeActions.Set.ExpandedWeeks action when expanded weeks query parameter is different then ' +
        'the ones currently in store', () => {
        let currentResult: CalendarScopeActions.Set.ExpandedWeeks = null;
        const storeExpandedWeeks = [currentWeekMoment.clone().subtract(1, 'w')];
        const urlExpandedWeeks = [currentWeekMoment];
        const urlExpandedWeeksEncoded = urlExpandedWeeks
            .map(week => week.format(MOMENT_YEAR_MONTH_DAY_FORMAT))
            .join(TASKS_CALENDAR_URL_QUERY_PARAMS_EXPANDED_WEEKS_SEPARATOR);
        const expandedWeeksParam = {[TasksCalendarUrlQueryParamsEnum.Expanded]: urlExpandedWeeksEncoded};
        const params = createParamMap(new URLSearchParams(expandedWeeksParam));
        const expectedAction = new CalendarScopeActions.Set.ExpandedWeeks(urlExpandedWeeks);

        expandedWeeks$.next(storeExpandedWeeks);
        queryParamMap$.next(params);
        calendarScopeEffects.queryParamsExpandedWeeksChange$
            .subscribe((result: CalendarScopeActions.Set.ExpandedWeeks) => currentResult = result);

        expect(currentResult).toBeDefined();
        expect(currentResult.payload.length).toEqual(expectedAction.payload.length);
        currentResult.payload.forEach(week => expectedAction.payload.some(expectedWeek => week.isSame(expectedWeek, 'd')));
    });

    it('should not trigger a CalendarScopeActions.Resolve.Focus action when URL query parameters do not have start', () => {
        let currentResult: Action = null;
        const params = createParamMap(new URLSearchParams());

        queryParamMap$.next(params);
        calendarScopeEffects.queryParamsFocusChange$.subscribe(result => currentResult = result);

        expect(currentResult).toBeNull();
    });

    it('should not trigger a CalendarScopeActions.Resolve.Focus action when URL query parameter focus is the same has ' +
        'the one currently in store and has more query parameters', () => {
        let currentResult: Action = null;
        const focusObject = new ObjectIdentifierPair(ObjectTypeEnum.Task, 'foo');
        const focusEncoded = new TasksCalendarFocusParams(focusObject.type, [focusObject.id]).toString();
        const focusParam = {[TasksCalendarUrlQueryParamsEnum.Focus]: focusEncoded};
        const otherParams = {foo: 'bar', tango: 'fox'};
        const params = createParamMap(new URLSearchParams({...focusParam, ...otherParams}));

        focus$.next(focusObject);
        queryParamMap$.next(params);
        calendarScopeEffects.queryParamsFocusChange$.subscribe(result => currentResult = result);

        expect(currentResult).toBeNull();
    });

    it('should trigger a CalendarScopeActions.Resolve.Focus action when URL query parameter has focus and other parameters and ' +
        'focus is different then the one currently in store', () => {
        let currentResult: Action = null;
        const focusObject = new ObjectIdentifierPair(ObjectTypeEnum.Task, 'foo');
        const storeFocus = new ObjectIdentifierPair(ObjectTypeEnum.Task, 'bar');
        const focusEncoded = new TasksCalendarFocusParams(focusObject.type, [focusObject.id]).toString();
        const focusParam = {[TasksCalendarUrlQueryParamsEnum.Focus]: focusEncoded};
        const otherParams = {foo: 'bar', tango: 'fox'};
        const params = createParamMap(new URLSearchParams({...focusParam, ...otherParams}));
        const expectedResult = new CalendarScopeActions.Resolve.Focus(focusObject);

        focus$.next(storeFocus);
        queryParamMap$.next(params);
        calendarScopeEffects.queryParamsFocusChange$.subscribe(result => currentResult = result);

        expect(currentResult).toEqual(expectedResult);
    });

    it('should trigger a CalendarScopeActions.Resolve.Focus action when URL query parameter has only focus', () => {
        let currentResult: Action = null;
        const focusObject = new ObjectIdentifierPair(ObjectTypeEnum.Task, 'foo');
        const storeFocus = focusObject;
        const focusEncoded = new TasksCalendarFocusParams(focusObject.type, [focusObject.id]).toString();
        const focusParam = {[TasksCalendarUrlQueryParamsEnum.Focus]: focusEncoded};
        const params = createParamMap(new URLSearchParams(focusParam));
        const expectedResult = new CalendarScopeActions.Resolve.Focus(focusObject);

        focus$.next(storeFocus);
        queryParamMap$.next(params);
        calendarScopeEffects.queryParamsFocusChange$.subscribe(result => currentResult = result);

        expect(currentResult).toEqual(expectedResult);
    });

    it('should resolve focus for a non existing task by triggering the correct actions', () => {
        const currentResult: Action[] = [];
        const task = MOCK_TASK_2;
        const taskObject = new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id);
        const expectedResult = nonExistingFocusDefaultActions;

        when(taskScheduleServiceMock.findOneByTaskId(task.id)).thenReturn(errorResponse);

        actions.next(new CalendarScopeActions.Resolve.Focus(taskObject));
        calendarScopeEffects.storeFocusChangeFromUrl$.subscribe(result => currentResult.push(result));

        expect(currentResult).toEqual(expectedResult);
    });

    it('should resolve focus for task by triggering the correct actions for a task which scope is not within the current week', () => {
        const currentResult: Action[] = [];
        const task = MOCK_TASK_2;
        const taskObject = new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id);
        const taskWeek = moment(MOCK_TASK_SCHEDULE_B.start);
        const expectedResult: Action[] = [
            new CalendarScopeActions.Initialize.ScopeParameters(),
            new CalendarScopeActions.Set.Start(taskWeek),
            new CalendarScopeActions.Set.Mode(calendarScopeParameters.mode),
            new CalendarScopeActions.Resolve.FocusFulfilled(taskObject),
        ];

        when(dateParserStrategyMock.startOfWeek(anything())).thenReturn(taskWeek);
        when(taskScheduleServiceMock.findOneByTaskId(task.id)).thenReturn(of(MOCK_TASK_SCHEDULE_RESOURCE_B));

        actions.next(new CalendarScopeActions.Resolve.Focus(taskObject));
        calendarScopeEffects.storeFocusChangeFromUrl$.subscribe(result => currentResult.push(result));

        expect(currentResult).toEqual(expectedResult);
    });

    it('should resolve focus for task by triggering the correct actions for a task which scope is within the current week', () => {
        const currentResult: Action[] = [];
        const task = MOCK_TASK_2;
        const taskObject = new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id);
        const taskScheduleWithinCurrentWeek = {
            ...MOCK_TASK_SCHEDULE_RESOURCE_B,
            start: currentWeekMoment.clone().subtract(3, 'w').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            end: currentWeekMoment.clone().add(3, 'w').format(API_DATE_YEAR_MONTH_DAY_FORMAT),
        };
        const expectedResult: Action[] = [
            new CalendarScopeActions.Initialize.ScopeParameters(),
            new CalendarScopeActions.Set.Start(currentWeekMoment),
            new CalendarScopeActions.Set.Mode(calendarScopeParameters.mode),
            new CalendarScopeActions.Resolve.FocusFulfilled(taskObject),
        ];

        when(taskScheduleServiceMock.findOneByTaskId(task.id)).thenReturn(of(taskScheduleWithinCurrentWeek));

        actions.next(new CalendarScopeActions.Resolve.Focus(taskObject));
        calendarScopeEffects.storeFocusChangeFromUrl$.subscribe(result => currentResult.push(result));

        expect(currentResult).toEqual(expectedResult);
    });

    it('should resolve focus for task by triggering the correct actions when store does not have calendar mode', () => {
        const currentResult: Action[] = [];
        const task = MOCK_TASK_2;
        const taskObject = new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id);
        const taskWeek = moment(MOCK_TASK_SCHEDULE_B.start).startOf('week');
        const defaultMode = TasksCalendarModeEnum.SixWeeks;
        const newCalendarScopeParameters = {} as CalendarScopeParameters;
        const expectedResult: Action[] = [
            new CalendarScopeActions.Initialize.ScopeParameters(),
            new CalendarScopeActions.Set.Start(taskWeek),
            new CalendarScopeActions.Set.Mode(defaultMode),
            new CalendarScopeActions.Resolve.FocusFulfilled(taskObject),
        ];

        when(dateParserStrategyMock.startOfWeek(anything())).thenReturn(taskWeek);
        when(taskScheduleServiceMock.findOneByTaskId(task.id)).thenReturn(of(MOCK_TASK_SCHEDULE_RESOURCE_B));

        calendarScopeParameters$.next(newCalendarScopeParameters);
        actions.next(new CalendarScopeActions.Resolve.Focus(taskObject));
        calendarScopeEffects.storeFocusChangeFromUrl$.subscribe(result => currentResult.push(result));

        expect(currentResult).toEqual(expectedResult);
    });

    it('should resolve focus for a non existing daycard by triggering the correct actions', () => {
        const currentResult: Action[] = [];
        const daycard = MOCK_DAY_CARD_A;
        const daycardObject = new ObjectIdentifierPair(ObjectTypeEnum.DayCard, daycard.id);
        const expectedResult = nonExistingFocusDefaultActions;

        when(dayCardServiceMock.findOne(daycard.id)).thenReturn(errorResponse);

        actions.next(new CalendarScopeActions.Resolve.Focus(daycardObject));
        calendarScopeEffects.storeFocusChangeFromUrl$.subscribe(result => currentResult.push(result));

        expect(currentResult).toEqual(expectedResult);
    });

    it('should resolve focus for daycard by triggering the correct actions', () => {
        const currentResult: Action[] = [];
        const daycard = MOCK_DAY_CARD_A;
        const daycardObject = new ObjectIdentifierPair(ObjectTypeEnum.DayCard, daycard.id);
        const daycardWeek = moment(daycard.date).startOf('week');
        const expectedResult: Action[] = [
            new ProjectTaskActions.Request.OneTaskScheduleByTaskIdFulfilled(MOCK_TASK_SCHEDULE_RESOURCE_A),
            new DayCardActions.Request.OneFulfilled(MOCK_DAY_CARD_RESOURCE_A),
            new CalendarScopeActions.Initialize.ScopeParameters(),
            new CalendarScopeActions.Set.Start(daycardWeek),
            new CalendarScopeActions.Set.Mode(calendarScopeParameters.mode),
            new CalendarScopeActions.Resolve.FocusFulfilled(daycardObject),
            new CalendarScopeActions.Set.ExpandedWeeks([daycardWeek]),
        ];

        when(dateParserStrategyMock.startOfWeek(anything())).thenReturn(daycardWeek);
        when(dayCardServiceMock.findOne(daycard.id)).thenReturn(of(MOCK_DAY_CARD_RESOURCE_A));
        when(taskScheduleServiceMock.findOneByTaskId(MOCK_DAY_CARD_A.task.id)).thenReturn(of(MOCK_TASK_SCHEDULE_RESOURCE_A));

        actions.next(new CalendarScopeActions.Resolve.Focus(daycardObject));
        calendarScopeEffects.storeFocusChangeFromUrl$.subscribe(result => currentResult.push(result));

        expect(currentResult).toEqual(expectedResult);
    });

    it('should resolve focus for daycard by triggering the correct actions when store does not have calendar mode', () => {
        const currentResult: Action[] = [];
        const daycard = MOCK_DAY_CARD_A;
        const daycardObject = new ObjectIdentifierPair(ObjectTypeEnum.DayCard, daycard.id);
        const daycardWeek = moment(daycard.date).startOf('week');
        const defaultMode = TasksCalendarModeEnum.SixWeeks;
        const newCalendarScopeParameters = {} as CalendarScopeParameters;
        const expectedResult: Action[] = [
            new ProjectTaskActions.Request.OneTaskScheduleByTaskIdFulfilled(MOCK_TASK_SCHEDULE_RESOURCE_A),
            new DayCardActions.Request.OneFulfilled(MOCK_DAY_CARD_RESOURCE_A),
            new CalendarScopeActions.Initialize.ScopeParameters(),
            new CalendarScopeActions.Set.Start(daycardWeek),
            new CalendarScopeActions.Set.Mode(defaultMode),
            new CalendarScopeActions.Resolve.FocusFulfilled(daycardObject),
            new CalendarScopeActions.Set.ExpandedWeeks([daycardWeek]),
        ];

        when(dateParserStrategyMock.startOfWeek(anything())).thenReturn(daycardWeek);
        when(dayCardServiceMock.findOne(daycard.id)).thenReturn(of(MOCK_DAY_CARD_RESOURCE_A));
        when(taskScheduleServiceMock.findOneByTaskId(MOCK_DAY_CARD_A.task.id)).thenReturn(of(MOCK_TASK_SCHEDULE_RESOURCE_A));

        calendarScopeParameters$.next(newCalendarScopeParameters);
        actions.next(new CalendarScopeActions.Resolve.Focus(daycardObject));
        calendarScopeEffects.storeFocusChangeFromUrl$.subscribe(result => currentResult.push(result));

        expect(currentResult).toEqual(expectedResult);
    });

    it('should resolve focus for a non existing milestone by triggering the correct actions', () => {
        const currentResult: Action[] = [];
        const milestone = MOCK_MILESTONE_HEADER;
        const milestoneObject = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, MOCK_MILESTONE_HEADER.id);
        const expectedResult = nonExistingFocusDefaultActions;

        when(milestoneServiceMock.findOne(milestone.id)).thenReturn(errorResponse);

        actions.next(new CalendarScopeActions.Resolve.Focus(milestoneObject));
        calendarScopeEffects.storeFocusChangeFromUrl$.subscribe(result => currentResult.push(result));

        expect(currentResult).toEqual(expectedResult);
    });

    it('should resolve focus for milestone by triggering the correct actions upon a ' +
        'CalendarScopeActions.Resolve.Focus action for a milestone when store has mode', () => {
        const currentResult: Action[] = [];
        const milestone = MOCK_MILESTONE_HEADER;
        const milestoneObject = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, MOCK_MILESTONE_HEADER.id);
        const milestoneWeek = moment(milestone.date).startOf('week');
        const mode = calendarScopeParameters.mode;
        const expectedResult: Action[] = [
            new CalendarScopeActions.Set.Start(milestoneWeek),
            new CalendarScopeActions.Set.Mode(mode),
            new MilestoneActions.Request.OneFulfilled(MOCK_MILESTONE_RESOURCE_HEADER),
            new CalendarScopeActions.Resolve.FocusFulfilled(milestoneObject),
        ];

        when(dateParserStrategyMock.startOfWeek(anything())).thenReturn(milestoneWeek);
        when(milestoneServiceMock.findOne(milestone.id)).thenReturn(of(MOCK_MILESTONE_RESOURCE_HEADER));

        actions.next(new CalendarScopeActions.Resolve.Focus(milestoneObject));
        calendarScopeEffects.storeFocusChangeFromUrl$.subscribe(result => currentResult.push(result));

        expect(currentResult).toEqual(expectedResult);
    });

    it('should resolve focus for milestone by triggering the correct actions upon a ' +
        'CalendarScopeActions.Resolve.Focus action for a milestone when store does not has mode', () => {
        const currentResult: Action[] = [];
        const milestone = MOCK_MILESTONE_HEADER;
        const milestoneObject = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, MOCK_MILESTONE_HEADER.id);
        const milestoneWeek = moment(milestone.date).startOf('week');
        const mode = TasksCalendarModeEnum.SixWeeks;
        const newCalendarScopeParameters = {} as CalendarScopeParameters;
        const expectedResult: Action[] = [
            new CalendarScopeActions.Set.Start(milestoneWeek),
            new CalendarScopeActions.Set.Mode(mode),
            new MilestoneActions.Request.OneFulfilled(MOCK_MILESTONE_RESOURCE_HEADER),
            new CalendarScopeActions.Resolve.FocusFulfilled(milestoneObject),
        ];

        when(dateParserStrategyMock.startOfWeek(anything())).thenReturn(milestoneWeek);
        when(milestoneServiceMock.findOne(milestone.id)).thenReturn(of(MOCK_MILESTONE_RESOURCE_HEADER));

        calendarScopeParameters$.next(newCalendarScopeParameters);
        actions.next(new CalendarScopeActions.Resolve.Focus(milestoneObject));
        calendarScopeEffects.storeFocusChangeFromUrl$.subscribe(result => currentResult.push(result));

        expect(currentResult).toEqual(expectedResult);
    });

    it('should not resolve navigate to element task when task schedule does not exist currently in store', () => {
        const currentResult: Action[] = [];
        const task = MOCK_TASK_2;
        const taskObject = new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id);

        when(taskScheduleQueriesMock.observeTaskScheduleByTaskId(task.id)).thenReturn(of(null));

        actions.next(new CalendarScopeActions.Resolve.NavigateToElement(taskObject));
        calendarScopeEffects.resolveNavigateToElement$.subscribe(result => currentResult.push(result));

        expect(currentResult.length).toEqual(0);
    });

    it('should resolve navigate to element task when task is not within current calendar scope and ' +
        'task does not overlap current week', () => {
        const currentResult: Action[] = [];
        const task = MOCK_TASK_2;
        const taskObject = new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id);
        const start = currentWeekMoment.clone().subtract(1, 'y').format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const end = currentWeekMoment.clone().subtract(11, 'm').format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const taskScheduleNotWithinCurrentWeekAndNotCurrentCalendarScope = {
            ...MOCK_TASK_SCHEDULE_B,
            start,
            end,
        };
        const expectedResult: Action[] = [
            new CalendarScopeActions.Set.Start(moment(start)),
            new CalendarScopeActions.Resolve.NavigateToElementFulfilled(taskObject),
        ];

        when(taskScheduleQueriesMock.observeTaskScheduleByTaskId(task.id))
            .thenReturn(of(taskScheduleNotWithinCurrentWeekAndNotCurrentCalendarScope));

        actions.next(new CalendarScopeActions.Resolve.NavigateToElement(taskObject));
        calendarScopeEffects.resolveNavigateToElement$.subscribe(result => currentResult.push(result));

        expect(currentResult).toEqual(expectedResult);
    });

    it('should resolve navigate to element task when task is not within current calendar scope but ' +
        'task does overlap current week', () => {
        const currentResult: Action[] = [];
        const task = MOCK_TASK_2;
        const taskObject = new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id);
        const projectFirstDayOfWeek = currentWeekMoment;
        const calendarStart = projectFirstDayOfWeek.clone().subtract(1, 'y');
        const calendarEnd = calendarStart.clone().add(6, 'w');
        const newCalendarScope = new TimeScope(calendarStart.toISOString(), calendarEnd.toISOString());
        const taskStart = projectFirstDayOfWeek.clone().subtract(1, 'w').format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const taskEnd = projectFirstDayOfWeek.clone().add(2, 'w').format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const taskScheduleNotWithinCurrentWeekAndNotCurrentCalendarScope = {
            ...MOCK_TASK_SCHEDULE_B,
            start: taskStart,
            end: taskEnd,
        };
        const expectedResult: Action[] = [
            new CalendarScopeActions.Set.Start(projectFirstDayOfWeek),
            new CalendarScopeActions.Resolve.NavigateToElementFulfilled(taskObject),
        ];

        when(taskScheduleQueriesMock.observeTaskScheduleByTaskId(task.id))
            .thenReturn(of(taskScheduleNotWithinCurrentWeekAndNotCurrentCalendarScope));

        calendarScope$.next(newCalendarScope);
        actions.next(new CalendarScopeActions.Resolve.NavigateToElement(taskObject));
        calendarScopeEffects.resolveNavigateToElement$.subscribe(result => currentResult.push(result));

        const firstResult = currentResult[0] as CalendarScopeActions.Set.Start;
        const secondResult = currentResult[1] as CalendarScopeActions.Resolve.NavigateToElementFulfilled;

        expect(currentResult.length).toEqual(expectedResult.length);
        expect(firstResult.payload.isSame(projectFirstDayOfWeek, 'd')).toBeTruthy();
        expect(secondResult).toEqual(expectedResult[1] as CalendarScopeActions.Resolve.NavigateToElementFulfilled);
    });

    it('should resolve navigate to element task when task is within current calendar scope and task does not overlap current week', () => {
        const currentResult: Action[] = [];
        const task = MOCK_TASK_2;
        const taskObject = new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id);
        const calendarStart = currentWeekMoment.clone().subtract(1, 'y');
        const calendarEnd = calendarStart.clone().add(6, 'w');
        const newCalendarScope = new TimeScope(calendarStart.toISOString(), calendarEnd.toISOString());
        const taskStart = calendarStart.clone().add(1, 'w').format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const taskEnd = calendarEnd.clone().subtract(1, 'w').format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const taskScheduleNotWithinCurrentWeekAndNotCurrentCalendarScope = {
            ...MOCK_TASK_SCHEDULE_B,
            start: taskStart,
            end: taskEnd,
        };
        const expectedResult: Action[] = [
            new CalendarScopeActions.Resolve.NavigateToElementFulfilled(taskObject),
        ];

        when(taskScheduleQueriesMock.observeTaskScheduleByTaskId(task.id))
            .thenReturn(of(taskScheduleNotWithinCurrentWeekAndNotCurrentCalendarScope));

        calendarScope$.next(newCalendarScope);
        actions.next(new CalendarScopeActions.Resolve.NavigateToElement(taskObject));
        calendarScopeEffects.resolveNavigateToElement$.subscribe(result => currentResult.push(result));

        expect(currentResult).toEqual(expectedResult);
    });

    it('should not resolve navigate to element when focus is fulfilled but calendar is not fulfilled', () => {
        const currentResult: Action[] = [];
        const task = MOCK_TASK_2;
        const taskObject = new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id);

        calendarScopeEffects.triggerNavigateToElement$.subscribe(result => currentResult.push(result));

        actions.next(new CalendarScopeActions.Resolve.FocusFulfilled(taskObject));

        expect(currentResult).toEqual([]);
    });

    it('should resolve navigate to element when focus is fulfilled and calendar is fulfilled', () => {
        const currentResult: Action[] = [];
        const task = MOCK_TASK_2;
        const taskObject = new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id);
        const expectedResult: Action[] = [
            new CalendarScopeActions.Resolve.NavigateToElementFulfilled(taskObject),
        ];

        calendarScopeEffects.triggerNavigateToElement$.subscribe(result => currentResult.push(result));

        actions.next(new CalendarScopeActions.Resolve.FocusFulfilled(taskObject));
        actions.next(new ProjectTaskActions.Request.AllCalendarFulfilled(new ProjectTaskListResource()));

        expect(currentResult).toEqual(expectedResult);
    });

    it('should resolve navigate to element only once when focus is fulfilled but calendar is fulfilled several times', () => {
        const currentResult: Action[] = [];
        const task = MOCK_TASK_2;
        const taskObject = new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id);
        const expectedResult: Action[] = [
            new CalendarScopeActions.Resolve.NavigateToElementFulfilled(taskObject),
        ];

        calendarScopeEffects.triggerNavigateToElement$.subscribe(result => currentResult.push(result));

        actions.next(new CalendarScopeActions.Resolve.FocusFulfilled(taskObject));
        actions.next(new ProjectTaskActions.Request.AllCalendarFulfilled(new ProjectTaskListResource()));
        actions.next(new ProjectTaskActions.Request.AllCalendarFulfilled(new ProjectTaskListResource()));
        actions.next(new ProjectTaskActions.Request.AllCalendarFulfilled(new ProjectTaskListResource()));

        expect(currentResult).toEqual(expectedResult);
    });

    it('should resolve navigate to element with a milestone ' +
        'and trigger CalendarScopeActions.Set.Start ' +
        'when the milestone is in the store ' +
        'and also not in the current calendar scope', (done) => {
        const milestone = MOCK_MILESTONE_CRAFT;
        const milestoneId = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestone.id);
        const milestoneWeek = milestone.date.clone().startOf('week');
        const calendarStart = milestoneWeek.clone().add(2, 'w');
        const calendarEnd = milestoneWeek.clone().add(6, 'w');
        const newCalendarScope = new TimeScope(calendarStart.toISOString(), calendarEnd.toISOString());

        const expectedActions = [
            new CalendarScopeActions.Set.Start(milestoneWeek),
            new CalendarScopeActions.Resolve.NavigateToElementFulfilled(milestoneId),
        ];

        when(dateParserStrategyMock.startOfWeek(milestone.date)).thenReturn(milestoneWeek);
        when(milestoneQueriesMock.observeMilestoneById(anything())).thenReturn(of(milestone));

        calendarScope$.next(newCalendarScope);
        actions.next(new CalendarScopeActions.Resolve.NavigateToElement(milestoneId));

        calendarScopeEffects.resolveNavigateToElement$
            .pipe(
                take(2),
                toArray()
            )
            .subscribe(resultActions => {
                expect(resultActions).toEqual(expectedActions);
                done();
            });
    });

    it('should resolve navigate to element with a milestone ' +
        'but not trigger CalendarScopeActions.Set.Start ' +
        'when the milestone is in the store ' +
        'and in the current calendar scope', (done) => {
        const milestone = MOCK_MILESTONE_CRAFT;
        const milestoneId = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestone.id);
        const milestoneWeek = milestone.date.clone().startOf('week');
        const calendarStart = milestoneWeek.clone().subtract(1, 'w');
        const calendarEnd = milestoneWeek.clone().add(5, 'w');
        const newCalendarScope = new TimeScope(calendarStart.toISOString(), calendarEnd.toISOString());

        const expectedActions = [
            new CalendarScopeActions.Resolve.NavigateToElementFulfilled(milestoneId),
        ];

        when(dateParserStrategyMock.startOfWeek(milestone.date)).thenReturn(milestoneWeek);
        when(milestoneQueriesMock.observeMilestoneById(anything())).thenReturn(of(milestone));

        calendarScope$.next(newCalendarScope);
        actions.next(new CalendarScopeActions.Resolve.NavigateToElement(milestoneId));

        calendarScopeEffects.resolveNavigateToElement$
            .pipe(
                take(1),
                toArray()
            )
            .subscribe(resultActions => {
                expect(resultActions).toEqual(expectedActions);
                done();
            });
    });
});
