/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {CraftResource} from '../../app/craft/api/resources/craft.resource';
import {CraftListResource} from '../../app/craft/api/resources/craft-list.resource';
import {ProjectCraftResource} from '../../app/project/project-common/api/crafts/resources/project-craft.resource';
import {ProjectCraftListResource} from '../../app/project/project-common/api/crafts/resources/project-craft-list.resource';
import {SaveProjectCraftResource} from '../../app/project/project-common/api/crafts/resources/save-project-craft.resource';
import {SaveProjectCraftListResource} from '../../app/project/project-common/api/crafts/resources/save-project-craft-list.resource';
import {ResourceReference} from '../../app/shared/misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../../app/shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {CRAFT_COLORS} from '../../app/shared/ui/constants/colors.constant';

export const CRAFT_RESOURCE_MOCK: CraftResource = {
    id: '123',
    name: 'craft 123',
    _links: {
        self: {
            href: 'http://localhost:8080/v1/crafts/c575e002-5305-4d7a-bc16-2aa88a991ca3',
        },
    },
};

export const CRAFT_RESOURCE_MOCK_B: CraftResource = {
    id: '456',
    name: 'craft 456',
    _links: {
        self: {
            href: 'http://localhost:8080/v1/crafts/c575e002-5305-4d7a-bc16-2aa88a991ca3B',
        },
    },
};

export const CRAFT_RESOURCE_LIST_MOCK: CraftResource[] = [CRAFT_RESOURCE_MOCK];

export const CRAFT_LIST_RESOURCE_MOCK: CraftListResource = {
    crafts: CRAFT_RESOURCE_LIST_MOCK,
    _links: {
        self: {
            href: 'http://localhost:8080/v1/crafts',
        },
    },
};

export const MOCK_SAVE_PROJECT_CRAFT: SaveProjectCraftResource = {
    projectId: '123',
    name: 'Save Craf',
    position: 2,
    color: CRAFT_COLORS[0].solid,
};

export const MOCK_PROJECT_CRAFT_A: ProjectCraftResource = {
    id: '1234',
    createdBy: new ResourceReferenceWithPicture('b8763b19-de8e-ea0d-2d6f-d77feb70a491', 'John Pianos', ''),
    createdDate: '1989-01-20T00:00:00.000Z',
    lastModifiedBy: new ResourceReference('b8763b19-de8e-ea0d-2d6f-d77feb70a491', 'John Pianos'),
    lastModifiedDate: '1989-01-20T00:00:00.000Z',
    version: 0,
    name: 'Craft A',
    color: CRAFT_COLORS[1].solid,
    position: 1,
    project: {
        displayName: 'something',
        id: 'c575e002-5305-4d7a-bc16-2aa88a991ca3',
    },
    _links: {
        self: {
            href: 'http://localhost:8080/v1/projects/crafts/#Thecraftid',
        },
        project: {
            href: 'http://localhost:8080/v1/projects/#Theprojectid',
        },
        update: {
            href: 'http://localhost:8080/v1/projects/#Theprojectid',
        },
        delete: {
            href: 'http://localhost:8080/v1/projects/#Theprojectid',
        },
    },
};

export const MOCK_PROJECT_CRAFT_B: ProjectCraftResource = {
    id: '123456',
    createdBy: new ResourceReferenceWithPicture('b8763b19-de8e-ea0d-2d6f-d77feb70a491', 'John Pianos', ''),
    createdDate: '1989-01-20T00:00:00.000Z',
    lastModifiedBy: new ResourceReference('b8763b19-de8e-ea0d-2d6f-d77feb70a491', 'John Pianos'),
    lastModifiedDate: '1989-01-20T00:00:00.000Z',
    version: 0,
    name: 'Craft B',
    color: CRAFT_COLORS[2].solid,
    position: 2,
    project: {
        displayName: 'something',
        id: 'c575e002-5305-4d7a-bc16-2aa88a991ca3',
    },
    _links: {
        self: {
            href: 'http://localhost:8080/v1/projects/crafts/#Thecraftid',
        },
        project: {
            href: 'http://localhost:8080/v1/projects/#Theprojectid',
        },
        update: {
            href: 'http://localhost:8080/v1/projects/#Theprojectid',
        },
    },
};

export const MOCK_PROJECT_CRAFT_C: ProjectCraftResource = {
    id: '123456789',
    createdBy: new ResourceReferenceWithPicture('b8763b19-de8e-ea0d-2d6f-d77feb70a491', 'John Pianos', ''),
    createdDate: '1989-01-20T00:00:00.000Z',
    lastModifiedBy: new ResourceReference('b8763b19-de8e-ea0d-2d6f-d77feb70a491', 'John Pianos'),
    lastModifiedDate: '1989-01-20T00:00:00.000Z',
    version: 0,
    name: 'Craft C',
    color: CRAFT_COLORS[2].solid,
    position: 3,
    project: {
        displayName: 'something',
        id: 'c575e002-5305-4d7a-bc16-2aa88a991ca3',
    },
    _links: {
        self: {
            href: 'http://localhost:8080/v1/projects/crafts/#Thecraftid',
        },
        project: {
            href: 'http://localhost:8080/v1/projects/#Theprojectid',
        },
    },
};

export const MOCK_PROJECT_CRAFTS: ProjectCraftResource[] = [
    MOCK_PROJECT_CRAFT_A,
    MOCK_PROJECT_CRAFT_B,
    MOCK_PROJECT_CRAFT_C,
    MOCK_PROJECT_CRAFT_A,
    MOCK_PROJECT_CRAFT_B,
    MOCK_PROJECT_CRAFT_C,
];

export const MOCK_CREATE_PROJECT_CRAFT: SaveProjectCraftResource = {
    projectId: 'c575e002-5305-4d7a-bc16-2aa88a991ca3',
    name: 'Craft B',
    color: CRAFT_COLORS[2].solid,
};

export const MOCK_PROJECT_CRAFT_LIST: ProjectCraftListResource = {
    projectCrafts: [
        MOCK_PROJECT_CRAFT_A,
        MOCK_PROJECT_CRAFT_B,
    ],
    version: 1,
    _links: {
        self: {
            href: 'url',
        },
    },
};

export const MOCK_POST_CRAFT_SUCCESS_ALERT_PAYLOAD: any = {
    message: {
        key: '',
    },
};

export const MOCK_SAVE_PROJECT_CRAFT_LIST: SaveProjectCraftListResource = {
    projectCraftId: '123',
    position: 2,
};

export const MOCK_SAVE_PROJECT_CRAFT_C_TO_A: SaveProjectCraftResource = {
    projectId: '456',
    name: MOCK_PROJECT_CRAFT_C.name,
    color: MOCK_PROJECT_CRAFT_C.color,
    position: 1,
    version: 1,
};

export const MOCK_UPDATE_PROJECT_CRAFT: any = {
    projectCraftId: '1234',
    saveProjectCraft: MOCK_SAVE_PROJECT_CRAFT,
};

export const MOCK_UPDATE_PROJECT_CRAFT_C_TO_A: any = {
    projectCraftId: MOCK_PROJECT_CRAFT_C.id,
    saveProjectCraft: MOCK_SAVE_PROJECT_CRAFT_C_TO_A,
};
