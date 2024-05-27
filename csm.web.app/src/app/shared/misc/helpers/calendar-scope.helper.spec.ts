/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';

import {DateParserStrategyStub} from '../../../../test/stubs/date-parser.strategy.stub';
import {TranslateServiceStub} from '../../../../test/stubs/translate-service.stub';
import {TasksCalendarModeEnum} from '../../../project/project-common/enums/tasks-calendar-mode.enum';
import {CalendarScopeParameters} from '../../../project/project-common/store/calendar/slice/calendar.scope-parameters';
import {MilestoneFilters} from '../../../project/project-common/store/milestones/slice/milestone-filters';
import {ProjectTaskFilters} from '../../../project/project-common/store/tasks/slice/project-task-filters';
import {DateParserStrategy} from '../../ui/dates/date-parser.strategy';
import {TimeScope} from '../api/datatypes/time-scope.datatype';
import {
    CALENDAR_WEEKS_BY_TASKS_CALENDAR_MODE,
    CalendarScopeHelper
} from './calendar-scope.helper';

describe('Calendar Scope Helper', () => {
    let calendarScopeHelper: CalendarScopeHelper;

    const milestoneFilters: MilestoneFilters = new MilestoneFilters();
    const projectTaskFilters: ProjectTaskFilters = new ProjectTaskFilters();

    const scopeParameters = new CalendarScopeParameters();

    function getReferenceEndDay(startDay: moment.Moment, mode: TasksCalendarModeEnum): moment.Moment {
        return startDay.clone().add(CALENDAR_WEEKS_BY_TASKS_CALENDAR_MODE[mode] - 1, 'w').endOf('week');
    }

    const referenceStartDay: moment.Moment = moment('2018-12-10').startOf('week');
    const referenceEndDay4Weeks = getReferenceEndDay(referenceStartDay, TasksCalendarModeEnum.FourWeeks);
    const referenceEndDay6Weeks = getReferenceEndDay(referenceStartDay, TasksCalendarModeEnum.SixWeeks);
    const referenceEndDay18Weeks = getReferenceEndDay(referenceStartDay, TasksCalendarModeEnum.EighteenWeeks);
    const referenceEndDay26Weeks = getReferenceEndDay(referenceStartDay, TasksCalendarModeEnum.TwentySixWeeks);

    function getTimeScope(start: moment.Moment, end: moment.Moment): TimeScope {
        return {
            start: start.clone(),
            end: end.clone(),
        };
    }

    const fourWeeksTargetDates: TimeScope = getTimeScope(referenceStartDay, referenceEndDay4Weeks);
    const sixWeeksTargetDates: TimeScope = getTimeScope(referenceStartDay, referenceEndDay6Weeks);
    const eighteenWeeksRoadmapTargetDates: TimeScope = getTimeScope(referenceStartDay, referenceEndDay18Weeks);
    const twentySixWeeksRoadmapTargetDates: TimeScope = getTimeScope(referenceStartDay, referenceEndDay26Weeks);

    const moduleDef: TestModuleMetadata = {
        providers: [
            {
                provide: DateParserStrategy,
                useClass: DateParserStrategyStub,
            },
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        scopeParameters.start = referenceStartDay.clone();
        scopeParameters.mode = TasksCalendarModeEnum.SixWeeks;
        projectTaskFilters.criteria.from = referenceStartDay.clone();
        projectTaskFilters.criteria.to = referenceEndDay6Weeks.clone();
        milestoneFilters.criteria.from = referenceStartDay.clone();
        milestoneFilters.criteria.to = referenceEndDay6Weeks.clone();
        calendarScopeHelper = TestBed.inject(CalendarScopeHelper);
    });

    it('should retrieve the expected dates when getCalendarScope is called with 4 weeks mode', () => {
        const scopeParams: CalendarScopeParameters = {
            start: referenceStartDay,
            mode: TasksCalendarModeEnum.FourWeeks,
        };
        const scope = calendarScopeHelper.getCalendarScope(scopeParams);

        expect(scope.start.isSame(fourWeeksTargetDates.start)).toBeTruthy();
        expect(scope.end.isSame(fourWeeksTargetDates.end)).toBeTruthy();
    });

    it('should retrieve the expected dates when getCalendarScope is called with 6 weeks mode', () => {
        const scopeParams: CalendarScopeParameters = {
            start: referenceStartDay,
            mode: TasksCalendarModeEnum.SixWeeks,
        };
        const scope = calendarScopeHelper.getCalendarScope(scopeParams);

        expect(scope.start.isSame(sixWeeksTargetDates.start)).toBeTruthy();
        expect(scope.end.isSame(sixWeeksTargetDates.end)).toBeTruthy();
    });

    it('should retrieve the expected dates when getCalendarScope is called with 18 weeks roadmap mode', () => {
        const scopeParams: CalendarScopeParameters = {
            start: referenceStartDay,
            mode: TasksCalendarModeEnum.EighteenWeeks,
        };
        const scope = calendarScopeHelper.getCalendarScope(scopeParams);

        expect(scope.start.isSame(eighteenWeeksRoadmapTargetDates.start)).toBeTruthy();
        expect(scope.end.isSame(eighteenWeeksRoadmapTargetDates.end)).toBeTruthy();
    });

    it('should retrieve the expected dates when getCalendarScope is called with 26 weeks roadmap mode', () => {
        const scopeParams: CalendarScopeParameters = {
            start: referenceStartDay,
            mode: TasksCalendarModeEnum.TwentySixWeeks,
        };
        const scope = calendarScopeHelper.getCalendarScope(scopeParams);

        expect(scope.start.isSame(twentySixWeeksRoadmapTargetDates.start)).toBeTruthy();
        expect(scope.end.isSame(twentySixWeeksRoadmapTargetDates.end)).toBeTruthy();
    });

    it('should return a ProjectTaskFilters given the calendar scope parameters and task calendar filters', () => {
        const expectedResult: ProjectTaskFilters = projectTaskFilters;
        const result = calendarScopeHelper.getTaskFiltersWithCalendarTruncatedDate(projectTaskFilters, scopeParameters);

        expect(result).toEqual(expectedResult);
    });

    it('should return a ProjectTaskFilters with the start date to the calendar scope start ' +
        'when the filters date is before the calendar scope', () => {
        projectTaskFilters.criteria.from = moment('2017-12-03');

        const result = calendarScopeHelper.getTaskFiltersWithCalendarTruncatedDate(projectTaskFilters, scopeParameters);

        expect(result.criteria.from.isSame(sixWeeksTargetDates.start)).toBeTruthy();
    });

    it('should return a ProjectTaskFilters with the end date to the calendar scope end ' +
        'when the filters date is after the calendar scope', () => {
        projectTaskFilters.criteria.to = moment('2020-01-27');

        const result = calendarScopeHelper.getTaskFiltersWithCalendarTruncatedDate(projectTaskFilters, scopeParameters);

        expect(result.criteria.to.isSame(sixWeeksTargetDates.end)).toBeTruthy();
    });

    it('should return a ProjectTaskFilters with the start and end dates from the calendar scope' +
        ' when the filter ones are not defined', () => {
        projectTaskFilters.criteria.to = undefined;
        projectTaskFilters.criteria.from = undefined;

        const result = calendarScopeHelper.getTaskFiltersWithCalendarTruncatedDate(projectTaskFilters, scopeParameters);

        expect(result.criteria.from.isSame(sixWeeksTargetDates.start)).toBeTruthy();
        expect(result.criteria.to.isSame(sixWeeksTargetDates.end)).toBeTruthy();
    });

    it('should return a MilestoneFilters given the calendar scope parameters and milestone filters', () => {
        const expectedResult: MilestoneFilters = milestoneFilters;
        const result = calendarScopeHelper.getMilestoneFiltersWithCalendarTruncatedDate(milestoneFilters, scopeParameters);

        expect(result).toEqual(expectedResult);
    });

    it('should return a MilestoneFilters with the start date to the calendar scope start ' +
        'when the filters date is before the calendar scope', () => {
        milestoneFilters.criteria.from = moment('2017-12-03');

        const result = calendarScopeHelper.getMilestoneFiltersWithCalendarTruncatedDate(milestoneFilters, scopeParameters);

        expect(result.criteria.from.isSame(sixWeeksTargetDates.start)).toBeTruthy();
    });

    it('should return a MilestoneFilters with the end date to the calendar scope end ' +
        'when the filters date is after the calendar scope', () => {
        milestoneFilters.criteria.to = moment('2020-01-27');

        const result = calendarScopeHelper.getMilestoneFiltersWithCalendarTruncatedDate(milestoneFilters, scopeParameters);

        expect(result.criteria.to.isSame(sixWeeksTargetDates.end)).toBeTruthy();
    });

    it('should return a MilestoneFilters with the start and end dates from the calendar scope' +
        ' when the filter ones are not defined', () => {
        milestoneFilters.criteria.to = undefined;
        milestoneFilters.criteria.from = undefined;

        const result = calendarScopeHelper.getMilestoneFiltersWithCalendarTruncatedDate(milestoneFilters, scopeParameters);

        expect(result.criteria.from.isSame(sixWeeksTargetDates.start)).toBeTruthy();
        expect(result.criteria.to.isSame(sixWeeksTargetDates.end)).toBeTruthy();
    });

    it('should retrieve right number of days when getModeDuration is called with 4 weeks mode', () => {
        expect(calendarScopeHelper.getModeDuration(TasksCalendarModeEnum.FourWeeks)).toBe(28);
    });

    it('should retrieve right number of days when getModeDuration is called with 6 weeks mode', () => {
        expect(calendarScopeHelper.getModeDuration(TasksCalendarModeEnum.SixWeeks)).toBe(42);
    });

    it('should retrieve right number of days when getModeDuration is called with 18 weeks roadmap mode', () => {
        expect(calendarScopeHelper.getModeDuration(TasksCalendarModeEnum.EighteenWeeks)).toBe(126);
    });

    it('should retrieve right number of days when getModeDuration is called with 26 weeks roadmap mode', () => {
        expect(calendarScopeHelper.getModeDuration(TasksCalendarModeEnum.TwentySixWeeks)).toBe(182);
    });
});
