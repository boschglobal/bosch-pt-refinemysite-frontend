/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {ProjectTaskFiltersAssignees} from '../../../store/tasks/slice/project-task-filters-criteria';

export class CalendarExportFilters {
    constructor(public assignees: ProjectTaskFiltersAssignees = new ProjectTaskFiltersAssignees(),
                public companyIds: string[] = [],
                public projectCraftIds: string[] = [],
                public from: moment.Moment = null,
                public to: moment.Moment = null,
                public status: string[] = [],
                public hasTopics: boolean | null = null,
                public topicCriticality: string[] = [],
                public includeDayCards: boolean = false,
                public workAreaIds: string[] = [],
                public includeMilestones: boolean = false,
                public allDaysInDateRange = false,
    ) {}
}
