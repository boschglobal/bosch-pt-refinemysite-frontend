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
import {
    ActivatedRoute,
    ActivationStart,
    GuardsCheckStart,
    NavigationExtras,
    Router
} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import * as moment from 'moment';
import {
    of,
    Subject
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {ObjectIdentifierPair} from '../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../shared/misc/enums/object-type.enum';
import {MOMENT_YEAR_MONTH_DAY_FORMAT} from '../../../shared/ui/dates/date.helper.service';
import {TasksCalendarModeEnum} from '../enums/tasks-calendar-mode.enum';
import {DayCard} from '../models/day-cards/day-card';
import {TasksCalendarFocusParams} from '../models/tasks-calendar-focus-params/tasks-calendar-focus-params';
import {CalendarScopeQueries} from '../store/calendar/calendar-scope/calendar-scope.queries';
import {DayCardQueries} from '../store/day-cards/day-card.queries';
import {
    TASKS_CALENDAR_URL_QUERY_PARAMS_EXPANDED_WEEKS_SEPARATOR,
    TASKS_CALENDAR_URL_QUERY_PARAMS_UPDATE_DEBOUNCE_TIME,
    TasksCalendarUrlQueryParamsEnum,
    TasksCalendarUrlQueryParamsHelper
} from './tasks-calendar-url-query-params.helper';

describe('Tasks Calendar URL Query Params Helper', () => {
    let router: Router;

    const activatedRouteMock = {};
    const daycardQueriesMock = mock(DayCardQueries);
    const calendarScopeQueriesMock = mock(CalendarScopeQueries);

    const focus$ = new Subject<ObjectIdentifierPair>();
    const expandedWeeks$ = new Subject<moment.Moment[]>();
    const calendarScopeParametersMode$ = new Subject<TasksCalendarModeEnum>();
    const calendarScopeParametersStart$ = new Subject<moment.Moment>();
    const currentWeek = moment().startOf('week');

    const routerNavigateBaseParams: NavigationExtras = {
        relativeTo: activatedRouteMock as unknown as ActivatedRoute,
        queryParamsHandling: 'merge',
        replaceUrl: true,
        skipLocationChange: false,
    };

    const moduleDef: TestModuleMetadata = {
        imports: [RouterTestingModule],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: activatedRouteMock,
            },
            {
                provide: CalendarScopeQueries,
                useValue: instance(calendarScopeQueriesMock),
            },
            {
                provide: DayCardQueries,
                useValue: instance(daycardQueriesMock),
            },
            TasksCalendarUrlQueryParamsHelper,
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        when(calendarScopeQueriesMock.observeFocus()).thenReturn(focus$);
        when(calendarScopeQueriesMock.observeExpandedWeeks()).thenReturn(expandedWeeks$);
        when(calendarScopeQueriesMock.observeCalendarScopeParametersMode()).thenReturn(calendarScopeParametersMode$);
        when(calendarScopeQueriesMock.observeCalendarScopeParametersStart()).thenReturn(calendarScopeParametersStart$);

        TestBed.inject(TasksCalendarUrlQueryParamsHelper);

        router = TestBed.inject(Router);
    });

    it('should update URL query parameters if store expanded weeks changes', fakeAsync(() => {
        const expandedWeeks = [currentWeek.clone()];
        const expandedWeeksEncoded = expandedWeeks.map(w => w.format(MOMENT_YEAR_MONTH_DAY_FORMAT))
            .join(TASKS_CALENDAR_URL_QUERY_PARAMS_EXPANDED_WEEKS_SEPARATOR);
        const expectedQueryParams = {[TasksCalendarUrlQueryParamsEnum.Expanded]: expandedWeeksEncoded};
        const expectedResult = {queryParams: expectedQueryParams, ...routerNavigateBaseParams};

        spyOn(router, 'navigate').and.callThrough();

        expandedWeeks$.next(expandedWeeks);

        tick(TASKS_CALENDAR_URL_QUERY_PARAMS_UPDATE_DEBOUNCE_TIME);

        expect(router.navigate).toHaveBeenCalledWith([], expectedResult);
    }));

    it('should update URL query parameters if store expanded weeks changes without any expanded week', fakeAsync(() => {
        const expectedQueryParams = {[TasksCalendarUrlQueryParamsEnum.Expanded]: null};
        const expectedResult = {queryParams: expectedQueryParams, ...routerNavigateBaseParams};

        spyOn(router, 'navigate').and.callThrough();

        expandedWeeks$.next([]);

        tick(TASKS_CALENDAR_URL_QUERY_PARAMS_UPDATE_DEBOUNCE_TIME);

        expect(router.navigate).toHaveBeenCalledWith([], expectedResult);
    }));

    it('should update URL query parameters if store focus changes for a task', fakeAsync(() => {
        const focus = new ObjectIdentifierPair(ObjectTypeEnum.Task, 'foo');
        const focusEncoded = new TasksCalendarFocusParams(focus.type, [focus.id]).toString();
        const expectedQueryParams = {[TasksCalendarUrlQueryParamsEnum.Focus]: focusEncoded};
        const expectedResult = {queryParams: expectedQueryParams, ...routerNavigateBaseParams};

        spyOn(router, 'navigate').and.callThrough();

        focus$.next(focus);

        tick(TASKS_CALENDAR_URL_QUERY_PARAMS_UPDATE_DEBOUNCE_TIME);

        expect(router.navigate).toHaveBeenCalledWith([], expectedResult);
    }));

    it('should update URL query parameters if store focus changes for a milestone', fakeAsync(() => {
        const focus = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, 'foo');
        const focusEncoded = new TasksCalendarFocusParams(focus.type, [focus.id]).toString();
        const expectedQueryParams = {[TasksCalendarUrlQueryParamsEnum.Focus]: focusEncoded};
        const expectedResult = {queryParams: expectedQueryParams, ...routerNavigateBaseParams};

        spyOn(router, 'navigate').and.callThrough();

        focus$.next(focus);

        tick(TASKS_CALENDAR_URL_QUERY_PARAMS_UPDATE_DEBOUNCE_TIME);

        expect(router.navigate).toHaveBeenCalledWith([], expectedResult);
    }));

    it('should update URL query parameters if store focus changes for a daycard', fakeAsync(() => {
        const taskId = 'bar';
        const focus = new ObjectIdentifierPair(ObjectTypeEnum.DayCard, 'foo');
        const focusEncoded = new TasksCalendarFocusParams(focus.type, [taskId, focus.id]).toString();
        const expectedQueryParams = {[TasksCalendarUrlQueryParamsEnum.Focus]: focusEncoded};
        const expectedResult = {queryParams: expectedQueryParams, ...routerNavigateBaseParams};

        when(daycardQueriesMock.observeDayCardById(focus.id)).thenReturn(of({task: {id: taskId}} as DayCard));
        spyOn(router, 'navigate').and.callThrough();

        focus$.next(focus);

        tick(TASKS_CALENDAR_URL_QUERY_PARAMS_UPDATE_DEBOUNCE_TIME);

        expect(router.navigate).toHaveBeenCalledWith([], expectedResult);
    }));

    it('should update URL query parameters if store focus changes to null', fakeAsync(() => {
        const expectedQueryParams = {[TasksCalendarUrlQueryParamsEnum.Focus]: null};
        const expectedResult = {queryParams: expectedQueryParams, ...routerNavigateBaseParams};

        spyOn(router, 'navigate').and.callThrough();

        focus$.next(null);

        tick(TASKS_CALENDAR_URL_QUERY_PARAMS_UPDATE_DEBOUNCE_TIME);

        expect(router.navigate).toHaveBeenCalledWith([], expectedResult);
    }));

    it('should update URL query parameters if store focus changes to an object which type is not supported', fakeAsync(() => {
        const expectedQueryParams = {[TasksCalendarUrlQueryParamsEnum.Focus]: null};
        const expectedResult = {queryParams: expectedQueryParams, ...routerNavigateBaseParams};
        const object = new ObjectIdentifierPair('UNKNOWN-TYPE' as ObjectTypeEnum, 'foo');

        spyOn(router, 'navigate').and.callThrough();

        focus$.next(object);

        tick(TASKS_CALENDAR_URL_QUERY_PARAMS_UPDATE_DEBOUNCE_TIME);

        expect(router.navigate).toHaveBeenCalledWith([], expectedResult);
    }));

    it('should update URL query parameters if store calendar scope parameters mode changes', fakeAsync(() => {
        const mode = TasksCalendarModeEnum.SixWeeks;
        const expectedQueryParams = {
            [TasksCalendarUrlQueryParamsEnum.Mode]: mode,
        };
        const expectedResult = {queryParams: expectedQueryParams, ...routerNavigateBaseParams};

        spyOn(router, 'navigate').and.callThrough();

        calendarScopeParametersMode$.next(mode);

        tick(TASKS_CALENDAR_URL_QUERY_PARAMS_UPDATE_DEBOUNCE_TIME);

        expect(router.navigate).toHaveBeenCalledWith([], expectedResult);
    }));

    it('should update URL query parameters if store calendar scope parameters start changes', fakeAsync(() => {
        const start = currentWeek.clone();
        const startEncoded = start.format(MOMENT_YEAR_MONTH_DAY_FORMAT);

        const expectedQueryParams = {
            [TasksCalendarUrlQueryParamsEnum.Start]: startEncoded,
        };
        const expectedResult = {queryParams: expectedQueryParams, ...routerNavigateBaseParams};

        spyOn(router, 'navigate').and.callThrough();

        calendarScopeParametersStart$.next(start);

        tick(TASKS_CALENDAR_URL_QUERY_PARAMS_UPDATE_DEBOUNCE_TIME);

        expect(router.navigate).toHaveBeenCalledWith([], expectedResult);
    }));

    it('should not update URL query parameters when current router event type is GuardsCheckStart', fakeAsync(() => {
        const mode = TasksCalendarModeEnum.SixWeeks;
        const routerNavigateSpy = spyOn(router, 'navigate').and.returnValue(new Promise<boolean>(() => Promise.resolve(true)));
        const routerEventsSpy = spyOn(router, 'events').and.returnValue(of(null));

        calendarScopeParametersMode$.next(mode);
        tick(TASKS_CALENDAR_URL_QUERY_PARAMS_UPDATE_DEBOUNCE_TIME);
        expect(routerNavigateSpy).toHaveBeenCalledTimes(1);

        routerNavigateSpy.calls.reset();

        routerEventsSpy.and.returnValue(of(GuardsCheckStart));
        calendarScopeParametersMode$.next(mode);
        tick(TASKS_CALENDAR_URL_QUERY_PARAMS_UPDATE_DEBOUNCE_TIME);

        expect(routerNavigateSpy).not.toHaveBeenCalled();
    }));

    it('should not update URL query parameters when current router event type is ActivationStart', fakeAsync(() => {
        const mode = TasksCalendarModeEnum.SixWeeks;
        const routerNavigateSpy = spyOn(router, 'navigate').and.returnValue(new Promise<boolean>(() => Promise.resolve(true)));
        const routerEventsSpy = spyOn(router, 'events').and.returnValue(of(null));

        calendarScopeParametersMode$.next(mode);
        tick(TASKS_CALENDAR_URL_QUERY_PARAMS_UPDATE_DEBOUNCE_TIME);
        expect(routerNavigateSpy).toHaveBeenCalledTimes(1);

        routerNavigateSpy.calls.reset();

        routerEventsSpy.and.returnValue(of(ActivationStart));
        calendarScopeParametersMode$.next(mode);
        tick(TASKS_CALENDAR_URL_QUERY_PARAMS_UPDATE_DEBOUNCE_TIME);

        expect(routerNavigateSpy).not.toHaveBeenCalled();
    }));

    it('should concat map actions to update URL query parameters', fakeAsync(() => {
        let promise1Resolver;
        const promise1 = new Promise<boolean>((resolve) => promise1Resolver = resolve);
        const promise2 = new Promise<boolean>(() => Promise.resolve(true));
        const routerNavigateSpy = spyOn(router, 'navigate');
        const start = currentWeek.clone();

        routerNavigateSpy.and.returnValue(promise1);
        calendarScopeParametersStart$.next(start);
        tick(TASKS_CALENDAR_URL_QUERY_PARAMS_UPDATE_DEBOUNCE_TIME);
        expect(routerNavigateSpy).toHaveBeenCalledTimes(1);

        routerNavigateSpy.and.returnValue(promise2);
        calendarScopeParametersStart$.next(start);
        tick(TASKS_CALENDAR_URL_QUERY_PARAMS_UPDATE_DEBOUNCE_TIME);
        expect(router.navigate).toHaveBeenCalledTimes(1);

        promise1Resolver();
        tick(0);
        expect(router.navigate).toHaveBeenCalledTimes(2);
    }));

    it('should buffer actions to update URL query parameters', fakeAsync(() => {
        const start = currentWeek.clone();
        const mode = TasksCalendarModeEnum.SixWeeks;
        const startEncoded = start.format(MOMENT_YEAR_MONTH_DAY_FORMAT);
        const focus = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, 'foo');
        const focusEncoded = new TasksCalendarFocusParams(focus.type, [focus.id]).toString();
        const expandedWeeks = [currentWeek.clone()];
        const expandedWeeksEncoded = expandedWeeks.map(w => w.format(MOMENT_YEAR_MONTH_DAY_FORMAT))
            .join(TASKS_CALENDAR_URL_QUERY_PARAMS_EXPANDED_WEEKS_SEPARATOR);
        const expectedQueryParams = {
            [TasksCalendarUrlQueryParamsEnum.Start]: startEncoded,
            [TasksCalendarUrlQueryParamsEnum.Mode]: mode,
            [TasksCalendarUrlQueryParamsEnum.Focus]: focusEncoded,
            [TasksCalendarUrlQueryParamsEnum.Expanded]: expandedWeeksEncoded,
        };
        const expectedResult = {queryParams: expectedQueryParams, ...routerNavigateBaseParams};

        spyOn(router, 'navigate').and.callThrough();

        calendarScopeParametersStart$.next(start);
        tick(TASKS_CALENDAR_URL_QUERY_PARAMS_UPDATE_DEBOUNCE_TIME - 1);
        expect(router.navigate).not.toHaveBeenCalled();

        calendarScopeParametersMode$.next(mode);
        tick(TASKS_CALENDAR_URL_QUERY_PARAMS_UPDATE_DEBOUNCE_TIME - 1);
        expect(router.navigate).not.toHaveBeenCalled();

        focus$.next(focus);
        tick(TASKS_CALENDAR_URL_QUERY_PARAMS_UPDATE_DEBOUNCE_TIME - 1);
        expect(router.navigate).not.toHaveBeenCalled();

        expandedWeeks$.next(expandedWeeks);
        tick(TASKS_CALENDAR_URL_QUERY_PARAMS_UPDATE_DEBOUNCE_TIME - 1);
        expect(router.navigate).not.toHaveBeenCalled();

        tick(1);
        expect(router.navigate).toHaveBeenCalledWith([], expectedResult);
    }));
});
