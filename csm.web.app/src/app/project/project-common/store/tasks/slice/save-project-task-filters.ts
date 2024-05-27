/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../../shared/rest/constants/date-format.constant';
import {ProjectTaskFilters} from './project-task-filters';
import {ProjectTaskFiltersAssignees} from './project-task-filters-criteria';

export class SaveProjectTaskFilters {
    constructor(public assignees: ProjectTaskFiltersAssignees,
                public projectCraftIds: string[],
                public from: string,
                public to: string,
                public status: string[],
                public hasTopics: boolean | null,
                public topicCriticality: string[],
                public workAreaIds: string[],
                public allDaysInDateRange: boolean,
                public projectId?: string) {
    }

    public static fromProjectTaskFilters(filters: ProjectTaskFilters): SaveProjectTaskFilters {
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
        } = filters.criteria;

        return new SaveProjectTaskFilters(
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
    }
}
