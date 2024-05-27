/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {SaveMilestoneFilters} from '../../app/project/project-common/api/milestones/resources/save-milestone-filters';
import {SaveProjectFiltersCriteriaResource} from '../../app/project/project-common/api/misc/resources/save-project-filters-criteria.resource';
import {RescheduleResource} from '../../app/project/project-common/api/reschedule/resources/reschedule.resource';
import {SaveRescheduleResource} from '../../app/project/project-common/api/reschedule/resources/save-reschedule.resource';
import {MilestoneFilters} from '../../app/project/project-common/store/milestones/slice/milestone-filters';
import {ProjectTaskFilters} from '../../app/project/project-common/store/tasks/slice/project-task-filters';
import {SaveProjectTaskFilters} from '../../app/project/project-common/store/tasks/slice/save-project-task-filters';
import {AbstractResource} from '../../app/shared/misc/api/resources/abstract.resource';

export const MOCK_SAVE_RESCHEDULE_RESOURCE: SaveRescheduleResource = {
    shiftDays: 10,
    useMilestoneCriteria: true,
    useTaskCriteria: true,
    criteria: Object.assign(new SaveProjectFiltersCriteriaResource(), {
        tasks: SaveProjectTaskFilters.fromProjectTaskFilters(new ProjectTaskFilters()),
        milestones: SaveMilestoneFilters.fromMilestoneFilters(new MilestoneFilters()),
    }),
};

export const MOCK_RESCHEDULE_RESOURCE: RescheduleResource = {
    successful: {
        milestones: [],
        tasks: [],
    },
    failed: {
        milestones: [],
        tasks: [],
    },
};

export const MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_MILESTONE: RescheduleResource = {
    successful: {
        milestones: [],
        tasks: [],
    },
    failed: {
        milestones: ['milestone-2'],
        tasks: [],
    },
};

export const MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_TASKS: RescheduleResource = {
    successful: {
        milestones: [],
        tasks: [],
    },
    failed: {
        milestones: [],
        tasks: ['bar'],
    },
};

export const MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_MILESTONES_AND_TASKS: RescheduleResource = {
    successful: {
        milestones: [],
        tasks: [],
    },
    failed: {
        milestones: ['foo'],
        tasks: ['bar'],
    },
};

export const MOCK_RESCHEDULE_JOB_ID_RESOURCE: AbstractResource = {
    id: 'c0ffeeee-abad-cafe-babe-decafbadbabe',
};

export const MOCK_RESCHEDULE_ONE_FULFILLED_ALERT_ID = '600dbabe-c001-c0de-ba5e-600dc0ffee';
