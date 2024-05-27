/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {SaveTaskConstraintsResource} from '../../app/project/project-common/api/task-constraints/resources/save-task-constraints.resource';
import {TaskConstraintsResource} from '../../app/project/project-common/api/task-constraints/resources/task-constraints.resource';
import {ResourceLink} from '../../app/shared/misc/api/datatypes/resource-link.datatype';

export const MOCK_SAVE_TASK_CONSTRAINTS_RESOURCE: SaveTaskConstraintsResource = {
    constraints: [
        'EQUIPMENT',
        'INFORMATION',
        'RESOURCES',
    ],
};

export const MOCK_TASK_CONSTRAINTS_RESOURCE: TaskConstraintsResource = {
    items: [
        {key: 'EQUIPMENT', name: 'EQUIPMENT'},
        {key: 'INFORMATION', name: 'INFORMATION'},
        {key: 'RESOURCES', name: 'RESOURCES'},
    ],
    version: 1,
    taskId: 'foo',
    _links: {
        self: new ResourceLink(),
        update: {
            href: 'link',
        },
    },
};

export const MOCK_TASK_CONSTRAINTS_RESOURCE_NO_UPDATE: TaskConstraintsResource = {
    items: [],
    version: 1,
    taskId: 'foo',
    _links: {
        self: new ResourceLink(),
    },
};

export const MOCK_TASK_CONSTRAINTS_RESOURCE_NO_ITEMS: TaskConstraintsResource = {
    items: [],
    version: 1,
    taskId: 'foo',
    _links: {
        self: new ResourceLink(),
        update: {
            href: 'link',
        },
    },
};
