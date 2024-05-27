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
    waitForAsync
} from '@angular/core/testing';
import {ActivatedRouteSnapshot} from '@angular/router';
import {Store} from '@ngrx/store';
import {cloneDeep} from 'lodash';
import * as moment from 'moment';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {MockStore} from '../../../../test/mocks/store';
import {State} from '../../../app.reducers';
import {ObjectIdentifierPair} from '../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../shared/misc/enums/object-type.enum';
import {RealtimeActions} from '../../../shared/realtime/store/realtime.actions';
import {DateParserStrategy} from '../../../shared/ui/dates/date-parser.strategy';
import {ProjectDateParserStrategy} from '../../project-common/helpers/project-date-parser.strategy';
import {TasksCalendarUrlQueryParamsEnum} from '../../project-common/helpers/tasks-calendar-url-query-params.helper';
import {CalendarScopeActions} from '../../project-common/store/calendar/calendar-scope/calendar-scope.actions';
import {TASKS_CALENDAR_DEFAULT_MODE} from '../../project-common/store/calendar/calendar-scope/calendar-scope.effects';
import {CalendarScopeQueries} from '../../project-common/store/calendar/calendar-scope/calendar-scope.queries';
import {CalendarScopeParameters} from '../../project-common/store/calendar/slice/calendar.scope-parameters';
import {CanSeeProjectCalendarGuard} from './can-see-project-calendar.guard';

describe('Can See Project Calendar Guard', () => {
    let guard: CanSeeProjectCalendarGuard;
    let store: Store<State>;
    let newActivatedRouteSnapshot: any;

    const calendarScopeQueriesMock = mock(CalendarScopeQueries);
    const dateParserStrategyMock = mock(ProjectDateParserStrategy);

    const mockedStart = moment().startOf('week');
    const projectId = 'bbdfd7c1-f3eb-0685-d8d5-535172ce59a2';
    const type: ObjectTypeEnum = ObjectTypeEnum.Project;
    const projectObjectIdentifierPair: ObjectIdentifierPair = new ObjectIdentifierPair(type, projectId);
    const setRealtimeContextAction = new RealtimeActions.Set.Context(projectObjectIdentifierPair);
    const defaultCalendarScopeParameters: CalendarScopeParameters = {
        start: mockedStart,
        mode: TASKS_CALENDAR_DEFAULT_MODE,
    };
    const activatedRouteSnapshot: ActivatedRouteSnapshot = {
        parent: {
            paramMap: {
                get: () => projectId,
            },
        },
        queryParamMap: {
            keys: Object.keys(defaultCalendarScopeParameters),
        },
    } as unknown as ActivatedRouteSnapshot;
    const moduleDef: TestModuleMetadata = {
        providers: [
            {
                provide: CalendarScopeQueries,
                useValue: instance(calendarScopeQueriesMock),
            },
            {
                provide: DateParserStrategy,
                useValue: instance(dateParserStrategyMock),
            },
            {
                provide: Store,
                useValue: new MockStore({}),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        when(calendarScopeQueriesMock.getCalendarScopeParameters()).thenReturn(defaultCalendarScopeParameters);
        when(dateParserStrategyMock.startOfWeek(mockedStart)).thenReturn(mockedStart);

        guard = TestBed.inject(CanSeeProjectCalendarGuard);
        store = TestBed.inject(Store);

        newActivatedRouteSnapshot = cloneDeep(activatedRouteSnapshot);
    });

    it('should allow activation of the route', () => {
        expect(guard.canActivate(activatedRouteSnapshot)).toBeTruthy();
    });

    it('should set realtime updates context to RealtimeContextEnum.All', () => {
        const expectedResult = setRealtimeContextAction;

        spyOn(store, 'dispatch');

        guard.canActivate(activatedRouteSnapshot);

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should not dispatch action to set scope parameters when activate route query parameters has start and mode', () => {
        const expectedResult = setRealtimeContextAction;

        newActivatedRouteSnapshot.queryParamMap.keys = [
            TasksCalendarUrlQueryParamsEnum.Start,
            TasksCalendarUrlQueryParamsEnum.Mode,
        ];

        spyOn(store, 'dispatch');

        guard.canActivate(newActivatedRouteSnapshot);

        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should not dispatch action to set scope parameters when activate route query parameter has focus', () => {
        const expectedResult = setRealtimeContextAction;

        newActivatedRouteSnapshot.queryParamMap.keys = [
            TasksCalendarUrlQueryParamsEnum.Focus,
        ];

        spyOn(store, 'dispatch');

        guard.canActivate(newActivatedRouteSnapshot);

        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch action to set scope parameters when activate route query parameters has only start', () => {
        const {start, mode} = defaultCalendarScopeParameters;
        const expectedResult = new CalendarScopeActions.Set.ScopeParameters({start, mode});

        newActivatedRouteSnapshot.queryParamMap.keys = [
            TasksCalendarUrlQueryParamsEnum.Start,
        ];

        spyOn(store, 'dispatch');

        guard.canActivate(newActivatedRouteSnapshot);

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch action to set scope parameters when activate route query parameters has only mode', () => {
        const {start, mode} = defaultCalendarScopeParameters;
        const expectedResult = new CalendarScopeActions.Set.ScopeParameters({start, mode});

        newActivatedRouteSnapshot.queryParamMap.keys = [
            TasksCalendarUrlQueryParamsEnum.Mode,
        ];

        spyOn(store, 'dispatch');

        guard.canActivate(newActivatedRouteSnapshot);

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch action to set scope parameters when activate route has no query parameters', () => {
        const {start, mode} = defaultCalendarScopeParameters;
        const expectedResult = new CalendarScopeActions.Set.ScopeParameters({start, mode});

        newActivatedRouteSnapshot.queryParamMap.keys = [];

        spyOn(store, 'dispatch');

        guard.canActivate(newActivatedRouteSnapshot);

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch action to set scope parameters when store has start and mode', () => {
        const {start, mode} = defaultCalendarScopeParameters;
        const expectedResult = new CalendarScopeActions.Set.ScopeParameters({start, mode});

        newActivatedRouteSnapshot.queryParamMap.keys = [];

        spyOn(store, 'dispatch');

        guard.canActivate(newActivatedRouteSnapshot);

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch action to set scope parameters when store does not have start and mode', () => {
        const {start, mode} = defaultCalendarScopeParameters;
        const expectedResult = new CalendarScopeActions.Set.ScopeParameters({start, mode});

        newActivatedRouteSnapshot.queryParamMap.keys = [];

        spyOn(store, 'dispatch');
        when(calendarScopeQueriesMock.getCalendarScopeParameters()).thenReturn({} as CalendarScopeParameters);
        when(dateParserStrategyMock.startOfWeek(undefined)).thenReturn(mockedStart);

        guard.canActivate(newActivatedRouteSnapshot);

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });
});
