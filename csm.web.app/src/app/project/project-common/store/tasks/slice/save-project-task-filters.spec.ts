/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../../shared/rest/constants/date-format.constant';
import {ProjectTaskFilters} from './project-task-filters';
import {SaveProjectTaskFilters} from './save-project-task-filters';

describe('Save Project Task Filters', () => {
    const projectTaskFilters: ProjectTaskFilters = new ProjectTaskFilters();

    projectTaskFilters.criteria.from = moment('2020-03-20');
    projectTaskFilters.criteria.to = moment('2020-08-20');

    it('should generate SaveProjectTaskFilters from ProjectTaskFilters', () => {
        const {
            assignees,
            projectCraftIds,
            from,
            to,
            status,
            hasTopics,
            topicCriticality,
            workAreaIds,
            allDaysInDateRange,
        } = projectTaskFilters.criteria;

        const expectedResult = new SaveProjectTaskFilters(
            assignees,
            projectCraftIds,
            from?.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            to?.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            status,
            hasTopics,
            topicCriticality,
            workAreaIds,
            allDaysInDateRange,
        );

        expect(SaveProjectTaskFilters.fromProjectTaskFilters(projectTaskFilters)).toEqual(expectedResult);
    });
});
