/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import * as moment from 'moment';
import {Moment} from 'moment';

import {ProjectTaskFiltersAssignees} from '../../../store/tasks/slice/project-task-filters-criteria';
import {CalendarExportFilters} from './calendar-export-filters';

describe('Calendar Export Filters', () => {
    it(`should format dates in the backend accepted format`, () => {
        const from: Moment = moment('2019-09-30');
        const to: Moment = moment('2019-10-20');
        const includeDayCards = true;
        const includeMilestones = true;
        const calendarExportFilters = new CalendarExportFilters(new ProjectTaskFiltersAssignees(), [], [], from, to,
            [], null, [], includeDayCards, [], includeMilestones);

        expect(calendarExportFilters.from).toBe(from);
        expect(calendarExportFilters.to).toBe(to);
        expect(calendarExportFilters.includeDayCards).toBe(includeDayCards);
        expect(calendarExportFilters.includeMilestones).toBe(includeMilestones);
    });
});
