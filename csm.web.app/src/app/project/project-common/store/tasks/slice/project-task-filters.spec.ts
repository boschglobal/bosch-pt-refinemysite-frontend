/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {cloneDeep} from 'lodash';
import * as moment from 'moment';

import {CommonFilterFormData} from '../../../containers/common-filter-capture/common-filter-capture.component';
import {TasksFilterFormData} from '../../../containers/tasks-filter-capture/tasks-filter-capture.component';
import {TaskStatusEnum} from '../../../enums/task-status.enum';
import {TopicCriticalityEnum} from '../../../enums/topic-criticality.enum';
import {ProjectTaskFilters} from './project-task-filters';
import {
    ProjectTaskFiltersAssignees,
    ProjectTaskFiltersCriteria
} from './project-task-filters-criteria';

describe('Project Task Filters', () => {
    const defaultTaskFilterFormData: TasksFilterFormData = {
        assignees: {
            participantIds: ['ass_1'],
            companyIds: [],
        },
        projectCraftIds: ['pc_1'],
        status: {
            [TaskStatusEnum.OPEN]: true,
            [TaskStatusEnum.CLOSED]: false,
            [TaskStatusEnum.DRAFT]: false,
            [TaskStatusEnum.STARTED]: false,
        },
        hasTopics: true,
        topicCriticality: {
            [TopicCriticalityEnum.CRITICAL]: true,
        },
        allDaysInDateRange: false,
    };
    const defaultCommonFilterFormData: CommonFilterFormData = {
        range: {
            start: moment('2021-09-08'),
            end: null,
        },
        workArea: {
            workAreaIds: ['wa_1'],
            header: false,
        },
    };

    const setFiltersCleanCriteria = (taskFilters: TasksFilterFormData, commonFilters: CommonFilterFormData): ProjectTaskFilters => {
        const {range: {start, end}, workArea: {workAreaIds}} = commonFilters;
        const {assignees: {participantIds, companyIds}, projectCraftIds, status, hasTopics, topicCriticality} = taskFilters;
        const filter = new ProjectTaskFilters();
        filter.criteria = new ProjectTaskFiltersCriteria();
        filter.criteria.assignees = new ProjectTaskFiltersAssignees(participantIds, companyIds);
        filter.criteria.projectCraftIds = projectCraftIds;
        filter.criteria.from = start;
        filter.criteria.to = end;
        filter.criteria.status = Object.keys(status).filter(key => !!status[key]);
        filter.criteria.hasTopics = hasTopics ? hasTopics : null;
        filter.criteria.topicCriticality = Object.keys(topicCriticality).filter(key => !!topicCriticality[key]);
        filter.criteria.workAreaIds = workAreaIds;

        return filter;
    };

    it('should generate a ProjectTaskFilters when calling fromFormData', () => {
        const expectedResult = setFiltersCleanCriteria(defaultTaskFilterFormData, defaultCommonFilterFormData);

        expect(ProjectTaskFilters.fromFormData(defaultTaskFilterFormData, defaultCommonFilterFormData)).toEqual(expectedResult);
    });

    it('should generate a ProjectTaskFilters without status when calling fromFormData', () => {
        const formData = cloneDeep(defaultTaskFilterFormData);
        formData.status = {
            [TaskStatusEnum.OPEN]: false,
            [TaskStatusEnum.CLOSED]: false,
            [TaskStatusEnum.DRAFT]: false,
            [TaskStatusEnum.STARTED]: false,
        };

        const expectedResult = setFiltersCleanCriteria(formData, defaultCommonFilterFormData);

        expect(ProjectTaskFilters.fromFormData(formData, defaultCommonFilterFormData)).toEqual(expectedResult);
    });

    it('should generate a ProjectTaskFilters with hasTopics as null when calling fromFormData', () => {
        const formData = cloneDeep(defaultTaskFilterFormData);
        formData.hasTopics = false;

        const expectedResult = setFiltersCleanCriteria(formData, defaultCommonFilterFormData);

        expect(ProjectTaskFilters.fromFormData(formData, defaultCommonFilterFormData)).toEqual(expectedResult);
    });

    it('should generate a ProjectTaskFilters without topic criticality when calling fromFormData', () => {
        const formData = cloneDeep(defaultTaskFilterFormData);
        formData.topicCriticality = {
            [TopicCriticalityEnum.CRITICAL]: false,
        };

        const expectedResult = setFiltersCleanCriteria(formData, defaultCommonFilterFormData);

        expect(ProjectTaskFilters.fromFormData(formData, defaultCommonFilterFormData)).toEqual(expectedResult);
    });
});
