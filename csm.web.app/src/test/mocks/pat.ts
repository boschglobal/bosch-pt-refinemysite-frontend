/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {PATResource} from '../../app/project/project-common/api/pats/resources/pat.resource';
import {PATListResource} from '../../app/project/project-common/api/pats/resources/pat-list.resource';
import {SavePATResource} from '../../app/project/project-common/api/pats/resources/save-pat.resource';
import {ResourceReference} from '../../app/shared/misc/api/datatypes/resource-reference.datatype';

export const MOCK_PAT_RESOURCE: PATResource = {
    createdBy: new ResourceReference('1', 'Bob Baumeister'),
    createdDate: '2023-10-01T00:00:00.000Z',
    description: 'test',
    expiresAt: '2023-10-31T00:00:00.000Z',
    id: 'foo',
    impersonatedUser: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    issuedAt: '2023-10-19T14:34:08.763Z',
    lastModifiedBy: new ResourceReference('1', 'Bob Baumeister'),
    lastModifiedDate: '2023-10-01T00:00:00.000Z',
    scopes: ['TIMELINE_API_READ'],
    token: 'fdgjfdgfdhopdfjhdfjh',
    type: 'RMSPAT1',
    version: 1,
    _links: {
        self: {
            href: '',
        },
    },
};

export const MOCK_PAT_RESOURCE_WITHOUT_DESCRIPTION: PATResource = {
    createdBy: new ResourceReference('1', 'Bob Baumeister'),
    createdDate: '2023-10-01T00:00:00.000Z',
    expiresAt: '2023-10-19T14:34:08.763Z',
    id: 'bar',
    impersonatedUser: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    issuedAt: '2023-10-19T14:34:08.763Z',
    lastModifiedBy: new ResourceReference('1', 'Bob Baumeister'),
    lastModifiedDate: '2023-10-01T00:00:00.000Z',
    scopes: ['TIMELINE_API_READ'],
    token: 'fdgjfdgfdhopdfjhdfjh',
    type: 'RMSPAT1',
    version: 1,
    _links: {
        self: {
            href: '',
        },
    },
};

export const MOCK_SAVE_PAT_RESOURCE: SavePATResource = {
    description: 'test',
    scopes: ['TIMELINE_API_READ'],
    validForMinutes: 525600,
};

export const MOCK_SAVE_PAT_RESOURCE_2: SavePATResource = {
    description: 'test',
    scopes: ['TIMELINE_API_READ'],
    validForMinutes: 43200,
};

export const MOCK_PAT_LIST_RESOURCE: PATListResource = {
    items: [
        {...MOCK_PAT_RESOURCE, id: 'foo'},
        {...MOCK_PAT_RESOURCE_WITHOUT_DESCRIPTION, id: 'bar'},
    ],
    _links: {
        create: {
            href: 'url',
        },
    },
};
