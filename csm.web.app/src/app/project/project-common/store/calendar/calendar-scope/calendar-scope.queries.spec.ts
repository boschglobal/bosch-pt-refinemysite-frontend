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
    MockStore,
    provideMockStore,
} from '@ngrx/store/testing';
import {cloneDeep} from 'lodash';
import * as moment from 'moment';
import {of} from 'rxjs';
import {
    instance,
    mock,
    when,
} from 'ts-mockito';

import {MOCK_MILESTONE_FILTERS} from '../../../../../../test/mocks/milestones';
import {DateParserStrategyStub} from '../../../../../../test/stubs/date-parser.strategy.stub';
import {State} from '../../../../../app.reducers';
import {ObjectIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {TimeScope} from '../../../../../shared/misc/api/datatypes/time-scope.datatype';
import {ObjectTypeEnum} from '../../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {CalendarScopeHelper} from '../../../../../shared/misc/helpers/calendar-scope.helper';
import {DateParserStrategy} from '../../../../../shared/ui/dates/date-parser.strategy';
import {TasksCalendarModeEnum} from '../../../enums/tasks-calendar-mode.enum';
import {MilestoneQueries} from '../../milestones/milestone.queries';
import {MilestoneFilters} from '../../milestones/slice/milestone-filters';
import {PROJECT_MODULE_INITIAL_STATE} from '../../project-module.initial-state';
import {ProjectTaskFilters} from '../../tasks/slice/project-task-filters';
import {ProjectTaskQueries} from '../../tasks/task-queries';
import {CALENDAR_MODULE_INITIAL_STATE} from '../calendar-module.initial-state';
import {CalendarScopeParameters} from '../slice/calendar.scope-parameters';
import {CALENDAR_SCOPE_SLICE_INITIAL_STATE} from './calendar-scope.initial-state';
import {CalendarScopeQueries} from './calendar-scope.queries';
import {CalendarScopeSlice} from './calendar-scope.slice';

describe('Calendar Scope Queries', () => {
    let calendarScopeHelper: CalendarScopeHelper;
    let calendarScopeQueries: CalendarScopeQueries;
    let store: MockStore;

    const referenceDate = moment();
    const start = referenceDate.clone();
    const mode = TasksCalendarModeEnum.SixWeeks;

    const projectTaskQueriesMock: ProjectTaskQueries = mock(ProjectTaskQueries);
    const milestoneQueriesMock: MilestoneQueries = mock(MilestoneQueries);

    const calendarScopeParameters = Object.assign(new CalendarScopeParameters(), {start, mode});

    const object = new ObjectIdentifierPair(ObjectTypeEnum.Task, 'foo');

    const projectTaskFilters = new ProjectTaskFilters();
    projectTaskFilters.criteria.projectCraftIds = ['foo', 'bar'];

    const calendarScopeSlice: CalendarScopeSlice = {
        ...CALENDAR_SCOPE_SLICE_INITIAL_STATE,
        scopeParameters: calendarScopeParameters,
    };

    const initialState: Pick<State, 'projectModule'> = {
        projectModule: {
            ...PROJECT_MODULE_INITIAL_STATE,
            calendarModule: {
                ...CALENDAR_MODULE_INITIAL_STATE,
                calendarScopeSlice,
            },
        },
    };

    const setStoreState = (newState: Pick<State, 'projectModule'>): void => {
        store.setState(newState);
        store.refreshState();
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            {
                provide: DateParserStrategy,
                useClass: DateParserStrategyStub,
            },
            {
                provide: MilestoneQueries,
                useValue: instance(milestoneQueriesMock),
            },
            {
                provide: ProjectTaskQueries,
                useValue: instance(projectTaskQueriesMock),
            },
            provideMockStore({initialState}),
            CalendarScopeQueries,
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        calendarScopeQueries = TestBed.inject(CalendarScopeQueries);
        store = TestBed.inject(MockStore);
        calendarScopeHelper = TestBed.inject(CalendarScopeHelper);
    });

    it('should observe expanded weeks', () => {
        let result;
        const newState = cloneDeep(initialState);
        const expandedWeeks = [moment()];

        calendarScopeQueries.observeExpandedWeeks()
            .subscribe(expanded => result = expanded);

        newState.projectModule.calendarModule.calendarScopeSlice.expandedWeeks = expandedWeeks;

        setStoreState(newState);

        expect(result).toBe(expandedWeeks);
    });

    it('should observe focus', () => {
        let result;
        const newState = cloneDeep(initialState);

        calendarScopeQueries.observeFocus()
            .subscribe(focus => result = focus);

        newState.projectModule.calendarModule.calendarScopeSlice.focus = object;

        setStoreState(newState);

        expect(result).toBe(object);
    });

    it('should observe focus resolve status', () => {
        let result;
        const newState = cloneDeep(initialState);
        const newRequestStatus = RequestStatusEnum.progress;

        calendarScopeQueries.observeFocusResolveStatus()
            .subscribe(status => result = status);

        newState.projectModule.calendarModule.calendarScopeSlice.focusResolveStatus = newRequestStatus;

        setStoreState(newState);

        expect(result).toBe(newRequestStatus);
    });

    it('should observe navigate to element', () => {
        let result;
        const newState = cloneDeep(initialState);

        calendarScopeQueries.observeNavigateToElement()
            .subscribe(focus => result = focus);

        newState.projectModule.calendarModule.calendarScopeSlice.navigateToElement = object;

        setStoreState(newState);

        expect(result).toBe(object);
    });

    it('should observe calendar scope parameters', () => {
        calendarScopeQueries
            .observeCalendarScopeParameters()
            .subscribe((result: CalendarScopeParameters) => {
                expect(result).toEqual(calendarScopeParameters);
            });
    });

    it('should observe calendar scope parameters when mode is defined but start is not', () => {
        const newState = cloneDeep(initialState);
        const results: CalendarScopeParameters[] = [];
        const newCalendarScopeParameters = Object.assign(new CalendarScopeParameters(), {mode: TasksCalendarModeEnum.EighteenWeeks});

        calendarScopeQueries
            .observeCalendarScopeParameters()
            .subscribe((result: CalendarScopeParameters) => results.push(result));

        newState.projectModule.calendarModule.calendarScopeSlice.scopeParameters = newCalendarScopeParameters;
        setStoreState(newState);

        expect(results.length).toBe(2);
        expect(results[0]).toEqual(calendarScopeParameters);
        expect(results[1]).toEqual(newCalendarScopeParameters);
    });

    it('should observe calendar scope parameters when start is defined but mode is not', () => {
        const newState = cloneDeep(initialState);
        const results: CalendarScopeParameters[] = [];
        const newCalendarScopeParameters = Object.assign(new CalendarScopeParameters(), {start: referenceDate.clone().add(1, 'y')});

        calendarScopeQueries
            .observeCalendarScopeParameters()
            .subscribe((result: CalendarScopeParameters) => results.push(result));

        newState.projectModule.calendarModule.calendarScopeSlice.scopeParameters = newCalendarScopeParameters;
        setStoreState(newState);

        expect(results.length).toBe(2);
        expect(results[0]).toEqual(calendarScopeParameters);
        expect(results[1]).toEqual(newCalendarScopeParameters);
    });

    it('should observe calendar scope parameters when mode and start are different from the previous', () => {
        const newState = cloneDeep(initialState);
        const results: CalendarScopeParameters[] = [];
        const newStart = referenceDate.clone().add(1, 'w');
        const newMode = TasksCalendarModeEnum.EighteenWeeks;
        const newCalendarScopeParameters = Object.assign(new CalendarScopeParameters(), {
            start: newStart,
            mode: newMode,
        });

        calendarScopeQueries
            .observeCalendarScopeParameters()
            .subscribe((result: CalendarScopeParameters) => results.push(result));

        newState.projectModule.calendarModule.calendarScopeSlice.scopeParameters = newCalendarScopeParameters;
        setStoreState(newState);

        expect(results.length).toBe(2);
        expect(results[0]).toEqual(calendarScopeParameters);
        expect(results[1]).toEqual(newCalendarScopeParameters);
    });

    it('should observe calendar scope parameters when mode is the same but start is different by a day from the previous', () => {
        const newState = cloneDeep(initialState);
        const results: CalendarScopeParameters[] = [];
        const secondStart = referenceDate.clone().add(1, 'd');
        const newCalendarScopeParameters = Object.assign(new CalendarScopeParameters(), {
            start: secondStart,
            mode: calendarScopeParameters.mode,
        });

        calendarScopeQueries
            .observeCalendarScopeParameters()
            .subscribe((result: CalendarScopeParameters) => results.push(result));

        newState.projectModule.calendarModule.calendarScopeSlice.scopeParameters = newCalendarScopeParameters;
        setStoreState(newState);

        expect(results.length).toBe(2);
        expect(results[0]).toEqual(calendarScopeParameters);
        expect(results[1]).toEqual(newCalendarScopeParameters);
    });

    it('should observe calendar scope parameters when mode is the same but start is same day from the previous', () => {
        const newState = cloneDeep(initialState);
        const results: CalendarScopeParameters[] = [];
        const newStart = referenceDate.clone().add(1, 'h');
        const newCalendarScopeParameters = Object.assign(new CalendarScopeParameters(), {
            start: newStart,
            mode: calendarScopeParameters.mode,
        });

        calendarScopeQueries
            .observeCalendarScopeParameters()
            .subscribe((result: CalendarScopeParameters) => results.push(result));

        newState.projectModule.calendarModule.calendarScopeSlice.scopeParameters = newCalendarScopeParameters;
        setStoreState(newState);

        expect(results.length).toBe(1);
        expect(results[0]).toEqual(calendarScopeParameters);
    });

    it('should observe calendar scope parameters when mode is different but start is the same from the previous', () => {
        const newState = cloneDeep(initialState);
        const results: CalendarScopeParameters[] = [];
        const newMode = TasksCalendarModeEnum.EighteenWeeks;
        const newCalendarScopeParameters = Object.assign(new CalendarScopeParameters(), {
            start: calendarScopeParameters.start,
            mode: newMode,
        });

        calendarScopeQueries
            .observeCalendarScopeParameters()
            .subscribe((result: CalendarScopeParameters) => results.push(result));

        newState.projectModule.calendarModule.calendarScopeSlice.scopeParameters = newCalendarScopeParameters;
        setStoreState(newState);

        expect(results.length).toBe(2);
        expect(results[0]).toEqual(calendarScopeParameters);
        expect(results[1]).toEqual(newCalendarScopeParameters);
    });

    it('should observe calendar scope parameters when mode and start are the same has the previous', () => {
        const newState = cloneDeep(initialState);
        const results: CalendarScopeParameters[] = [];
        const newCalendarScopeParameters = Object.assign(new CalendarScopeParameters(), {
            start: calendarScopeParameters.start,
            mode: calendarScopeParameters.mode,
        });

        calendarScopeQueries
            .observeCalendarScopeParameters()
            .subscribe((result: CalendarScopeParameters) => results.push(result));

        newState.projectModule.calendarModule.calendarScopeSlice.scopeParameters = newCalendarScopeParameters;
        setStoreState(newState);

        expect(results.length).toBe(1);
        expect(results[0]).toEqual(calendarScopeParameters);
    });

    it('should observe calendar scope parameters mode', () => {
        calendarScopeQueries
            .observeCalendarScopeParametersMode()
            .subscribe((result: TasksCalendarModeEnum) =>
                expect(result).toEqual(calendarScopeParameters.mode));
    });

    it('should observe calendar scope parameters mode when mode is different from the previous', () => {
        const results: TasksCalendarModeEnum[] = [];
        const newState = cloneDeep(initialState);
        const newMode: TasksCalendarModeEnum = TasksCalendarModeEnum.EighteenWeeks;

        calendarScopeQueries
            .observeCalendarScopeParametersMode()
            .subscribe((result: TasksCalendarModeEnum) => results.push(result));

        newState.projectModule.calendarModule.calendarScopeSlice.scopeParameters.mode = newMode;
        setStoreState(newState);

        expect(results.length).toBe(2);
        expect(results[0]).toEqual(calendarScopeParameters.mode);
        expect(results[1]).toEqual(newMode);
    });

    it('should observe calendar scope parameters mode when mode is same has the previous', () => {
        const results: TasksCalendarModeEnum[] = [];
        const newState = cloneDeep(initialState);
        const sameMode = calendarScopeParameters.mode;

        calendarScopeQueries
            .observeCalendarScopeParametersMode()
            .subscribe((result: TasksCalendarModeEnum) => results.push(result));

        newState.projectModule.calendarModule.calendarScopeSlice.scopeParameters.mode = sameMode;
        setStoreState(newState);

        expect(results.length).toBe(1);
        expect(results[0]).toEqual(sameMode);
    });

    it('should observe calendar scope parameters start', () => {
        calendarScopeQueries
            .observeCalendarScopeParametersStart()
            .subscribe((result: moment.Moment) =>
                expect(result).toEqual(calendarScopeParameters.start));
    });

    it('should observe calendar scope parameters start when start is the same has the last value', () => {
        const results: moment.Moment[] = [];
        const newState = cloneDeep(initialState);
        const previousStart = referenceDate;

        calendarScopeQueries
            .observeCalendarScopeParametersStart()
            .subscribe((result: moment.Moment) => results.push(result));

        newState.projectModule.calendarModule.calendarScopeSlice.scopeParameters.start = previousStart;
        setStoreState(newState);

        expect(results.length).toBe(1);
        expect(results[0]).toEqual(previousStart);
    });

    it('should observe calendar scope parameters start when start is different by a day from the last value', () => {
        const results: moment.Moment[] = [];
        const newState = cloneDeep(initialState);
        const newStart = referenceDate.clone().subtract(1, 'd');

        calendarScopeQueries
            .observeCalendarScopeParametersStart()
            .subscribe((result: moment.Moment) => results.push(result));

        newState.projectModule.calendarModule.calendarScopeSlice.scopeParameters.start = newStart;
        setStoreState(newState);

        expect(results.length).toBe(2);
        expect(results[0]).toEqual(calendarScopeParameters.start);
        expect(results[1]).toEqual(newStart);
    });

    it('should observe calendar scope parameters start when start is same by a day from the last value', () => {
        const results: moment.Moment[] = [];
        const newState = cloneDeep(initialState);
        const previousStart = referenceDate;
        const newStart = previousStart.clone().add(1, 'h');

        calendarScopeQueries
            .observeCalendarScopeParametersStart()
            .subscribe((result: moment.Moment) => results.push(result));

        newState.projectModule.calendarModule.calendarScopeSlice.scopeParameters.start = newStart;
        setStoreState(newState);

        expect(results.length).toBe(1);
        expect(results[0]).toEqual(previousStart);
    });

    it('should observe calendar scope', () => {
        const expectedResult = calendarScopeHelper.getCalendarScope(calendarScopeParameters);

        calendarScopeQueries
            .observeCalendarScope()
            .subscribe((result: TimeScope) =>
                expect(result).toEqual(expectedResult));
    });

    it('should observe calendar task filters', () => {
        const expectedResult = calendarScopeHelper.getTaskFiltersWithCalendarTruncatedDate(projectTaskFilters, calendarScopeParameters);

        when(projectTaskQueriesMock.observeCalendarFilters()).thenReturn(of(projectTaskFilters));

        calendarScopeQueries
            .observeCalendarTaskFiltersWithTruncatedDates()
            .subscribe((result: ProjectTaskFilters) =>
                expect(result).toEqual(expectedResult));
    });

    it('should observe default calendar task filters', () => {
        const expectedResult = calendarScopeHelper.getTaskFiltersWithCalendarTruncatedDate(
            new ProjectTaskFilters(), calendarScopeParameters);

        calendarScopeQueries
            .observeDefaultCalendarTaskFiltersWithTruncatedDates()
            .subscribe((result: ProjectTaskFilters) =>
                expect(result).toEqual(expectedResult));
    });

    it('should observe milestone filters', () => {
        const expectedResult = calendarScopeHelper.getMilestoneFiltersWithCalendarTruncatedDate(
            MOCK_MILESTONE_FILTERS, calendarScopeParameters);

        when(milestoneQueriesMock.observeFilters()).thenReturn(of(MOCK_MILESTONE_FILTERS));

        calendarScopeQueries
            .observeMilestoneFiltersWithTruncatedDates()
            .subscribe((result: MilestoneFilters) =>
                expect(result).toEqual(expectedResult));
    });

    it('should observe default milestone filters', () => {
        const expectedResult = calendarScopeHelper.getMilestoneFiltersWithCalendarTruncatedDate(
            new MilestoneFilters(), calendarScopeParameters);

        calendarScopeQueries
            .observeDefaultMilestoneFiltersWithTruncatedDates()
            .subscribe((result: MilestoneFilters) =>
                expect(result).toEqual(expectedResult));
    });

    it('should retrieve calendar scope parameters', () => {
        expect(calendarScopeQueries.getCalendarScopeParameters()).toEqual(calendarScopeParameters);
    });
});
