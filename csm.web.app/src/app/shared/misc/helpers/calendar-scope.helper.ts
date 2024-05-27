/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import * as moment from 'moment';

import {TasksCalendarModeEnum} from '../../../project/project-common/enums/tasks-calendar-mode.enum';
import {CalendarScopeParameters} from '../../../project/project-common/store/calendar/slice/calendar.scope-parameters';
import {MilestoneFilters} from '../../../project/project-common/store/milestones/slice/milestone-filters';
import {MilestoneFiltersCriteria} from '../../../project/project-common/store/milestones/slice/milestone-filters-criteria';
import {ProjectTaskFilters} from '../../../project/project-common/store/tasks/slice/project-task-filters';
import {ProjectTaskFiltersCriteria} from '../../../project/project-common/store/tasks/slice/project-task-filters-criteria';
import {DateParserStrategy} from '../../ui/dates/date-parser.strategy';
import {TimeScope} from '../api/datatypes/time-scope.datatype';

export const CALENDAR_WEEKS_BY_TASKS_CALENDAR_MODE: {[key in TasksCalendarModeEnum]: number} = {
    [TasksCalendarModeEnum.FourWeeks]: 4,
    [TasksCalendarModeEnum.SixWeeks]: 6,
    [TasksCalendarModeEnum.EighteenWeeks]: 18,
    [TasksCalendarModeEnum.TwentySixWeeks]: 26,
};

@Injectable({
    providedIn: 'root',
})
export class CalendarScopeHelper {

    constructor(private readonly _dateParser: DateParserStrategy) {
    }

    public getCalendarScope(scopeParameters: CalendarScopeParameters): TimeScope {
        const {start: baseStart, mode} = scopeParameters;
        const start = this._dateParser.startOfWeek(baseStart);
        const computedEnd = start.clone().add(CALENDAR_WEEKS_BY_TASKS_CALENDAR_MODE[mode] - 1, 'w');
        const end = this._dateParser.endOfWeek(computedEnd);

        return {
            start,
            end,
        };
    }

    public getMilestoneFiltersWithCalendarTruncatedDate(filters: MilestoneFilters, scope: CalendarScopeParameters): MilestoneFilters {
        const {from, to} = filters.criteria;
        const {start, end} = this._truncateTimeScope({start: from, end: to}, scope);
        const newCriteria = Object.assign(new MilestoneFiltersCriteria(), filters.criteria, {
            from: start,
            to: end,
        });

        return Object.assign(new MilestoneFilters(), filters, {criteria: newCriteria});
    }

    public getTaskFiltersWithCalendarTruncatedDate(filters: ProjectTaskFilters, scope: CalendarScopeParameters): ProjectTaskFilters {
        const {from, to} = filters.criteria;
        const {start, end} = this._truncateTimeScope({start: from, end: to}, scope);
        const newCriteria = Object.assign(new ProjectTaskFiltersCriteria(), filters.criteria, {
            from: start,
            to: end,
        });

        return Object.assign(new ProjectTaskFilters(), filters, {criteria: newCriteria});
    }

    /**
     * @description Retrieves the number of days of the given mode
     * @param mode
     */
    public getModeDuration(mode: TasksCalendarModeEnum): number {
        return CALENDAR_WEEKS_BY_TASKS_CALENDAR_MODE[mode] * 7;
    }

    private _truncateTimeScope(timeScope: TimeScope, calendarScopeParameters: CalendarScopeParameters): TimeScope {
        const {start, end} = timeScope;
        const calendarTimeScope = this.getCalendarScope(calendarScopeParameters);

        return {
            start: (start ? moment.max(start, calendarTimeScope.start) : calendarTimeScope.start).clone(),
            end: (end ? moment.min(end, calendarTimeScope.end) : calendarTimeScope.end).clone(),
        };
    }
}
