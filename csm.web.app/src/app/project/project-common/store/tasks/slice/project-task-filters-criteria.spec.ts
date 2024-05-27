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
import {
    ProjectTaskFiltersAssignees,
    ProjectTaskFiltersCriteria
} from './project-task-filters-criteria';

describe('Project Task Filters Criteria', () => {
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

    it('should generate a ProjectTaskFiltersCriteria when calling fromFormData', () => {
        const {range: {start, end}, workArea: {workAreaIds}} = defaultCommonFilterFormData;
        const {assignees: {participantIds, companyIds}, projectCraftIds} = defaultTaskFilterFormData;
        const expectedResult = Object.assign(new ProjectTaskFiltersCriteria(), {
            assignees: new ProjectTaskFiltersAssignees(participantIds, companyIds),
            projectCraftIds,
            from: start,
            to: end,
            status: [TaskStatusEnum.OPEN],
            hasTopics: true,
            topicCriticality: [TopicCriticalityEnum.CRITICAL],
            workAreaIds,
        });

        expect(ProjectTaskFiltersCriteria.fromFormData(defaultTaskFilterFormData, defaultCommonFilterFormData)).toEqual(expectedResult);
    });

    it('should generate a ProjectTaskFiltersCriteria without status when calling fromFormData', () => {
        const formData = cloneDeep(defaultTaskFilterFormData);
        const {range: {start, end}, workArea: {workAreaIds}} = defaultCommonFilterFormData;
        const {assignees: {participantIds, companyIds}, projectCraftIds} = formData;
        const expectedResult = Object.assign(new ProjectTaskFiltersCriteria(), {
            assignees: new ProjectTaskFiltersAssignees(participantIds, companyIds),
            projectCraftIds,
            from: start,
            to: end,
            status: [],
            hasTopics: true,
            topicCriticality: [TopicCriticalityEnum.CRITICAL],
            workAreaIds,
        });

        formData.status = {
            [TaskStatusEnum.OPEN]: false,
            [TaskStatusEnum.CLOSED]: false,
            [TaskStatusEnum.DRAFT]: false,
            [TaskStatusEnum.STARTED]: false,
        };

        expect(ProjectTaskFiltersCriteria.fromFormData(formData, defaultCommonFilterFormData)).toEqual(expectedResult);
    });

    it('should generate a ProjectTaskFiltersCriteria with hasTopics as null when calling fromFormData', () => {
        const formData = cloneDeep(defaultTaskFilterFormData);
        const {range: {start, end}, workArea: {workAreaIds}} = defaultCommonFilterFormData;
        const {assignees: {participantIds, companyIds}, projectCraftIds} = formData;
        const expectedResult = Object.assign(new ProjectTaskFiltersCriteria(), {
            assignees: new ProjectTaskFiltersAssignees(participantIds, companyIds),
            projectCraftIds,
            from: start,
            to: end,
            status: [TaskStatusEnum.OPEN],
            hasTopics: null,
            topicCriticality: [TopicCriticalityEnum.CRITICAL],
            workAreaIds,
        });

        formData.hasTopics = false;

        expect(ProjectTaskFiltersCriteria.fromFormData(formData, defaultCommonFilterFormData)).toEqual(expectedResult);
    });

    it('should generate a ProjectTaskFiltersCriteria without topic criticality when calling fromFormData', () => {
        const formData = cloneDeep(defaultTaskFilterFormData);
        const {range: {start, end}, workArea: {workAreaIds}} = defaultCommonFilterFormData;
        const {assignees: {participantIds, companyIds}, projectCraftIds} = formData;
        const expectedResult = Object.assign(new ProjectTaskFiltersCriteria(), {
            assignees: new ProjectTaskFiltersAssignees(participantIds, companyIds),
            projectCraftIds,
            from: start,
            to: end,
            status: [TaskStatusEnum.OPEN],
            hasTopics: true,
            topicCriticality: [],
            workAreaIds,
        });

        formData.topicCriticality = {
            [TopicCriticalityEnum.CRITICAL]: false,
        };

        expect(ProjectTaskFiltersCriteria.fromFormData(formData, defaultCommonFilterFormData)).toEqual(expectedResult);
    });
});
