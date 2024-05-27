/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {CreateProjectCopyResource} from '../../app/project/project-common/api/project-copy/resources/create-project-copy.resource';

export const MOCK_PROJECT_COPY_RESOURCE_1: CreateProjectCopyResource = {
    projectName: 'Öhlmühle (Copy)',
    workingAreas: true,
    disciplines: true,
    milestones: true,
    tasks: true,
    dayCards: true,
    keepTaskStatus: true,
    keepTaskAssignee: true,
};
