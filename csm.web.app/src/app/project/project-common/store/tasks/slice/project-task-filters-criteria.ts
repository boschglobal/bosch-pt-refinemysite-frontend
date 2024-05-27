/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Moment} from 'moment';

import {CommonFilterFormData} from '../../../containers/common-filter-capture/common-filter-capture.component';
import {TasksFilterFormData} from '../../../containers/tasks-filter-capture/tasks-filter-capture.component';

export class ProjectTaskFiltersCriteria {
    public assignees: ProjectTaskFiltersAssignees = new ProjectTaskFiltersAssignees();
    public projectCraftIds: string[] = [];
    public from?: Moment = null;
    public to?: Moment = null;
    public status: string[] = [];
    public hasTopics: boolean | null = null;
    public topicCriticality: string[] = [];
    public workAreaIds: string[] = [];
    public allDaysInDateRange = false;
    public projectId?: string;

    public static fromFormData(formData: TasksFilterFormData, commonFilters: CommonFilterFormData): ProjectTaskFiltersCriteria {
        const {range: {start: from, end: to}, workArea: {workAreaIds}} = commonFilters;
        const {
            assignees: {
                participantIds,
                companyIds,
            },
            projectCraftIds,
            status,
            hasTopics,
            topicCriticality,
            allDaysInDateRange,
        } = formData;

        return Object.assign<ProjectTaskFiltersCriteria, ProjectTaskFiltersCriteria>(new ProjectTaskFiltersCriteria(), {
            allDaysInDateRange,
            projectCraftIds,
            from,
            to,
            workAreaIds,
            assignees: new ProjectTaskFiltersAssignees(participantIds, companyIds),
            status: ProjectTaskFiltersCriteria.getStatus(status),
            hasTopics: ProjectTaskFiltersCriteria.getHasTopics(hasTopics),
            topicCriticality: ProjectTaskFiltersCriteria.getTopicCriticality(topicCriticality),
        });
    }

    protected static getStatus(status: TasksFilterFormData['status']): string[] {
        return Object.keys(status).filter(key => status[key]);
    }

    protected static getHasTopics(hasTopics: TasksFilterFormData['hasTopics']): boolean | null {
        return hasTopics ? hasTopics : null;
    }

    protected static getTopicCriticality(topicCriticality: TasksFilterFormData['topicCriticality']): string[] {
        return Object.keys(topicCriticality).filter(key => topicCriticality[key]);
    }
}

export class ProjectTaskFiltersAssignees {

    constructor(public participantIds: string[] = [],
                public companyIds: string[] = []) {
    }
}
