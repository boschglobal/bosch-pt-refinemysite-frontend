/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ProjectListResource} from '../../app/project/project-common/api/projects/resources/project-list.resource';
import {
    MOCK_PROJECT_1,
    MOCK_PROJECT_2
} from './projects';

export const TEST_PROJECT_LIST: ProjectListResource = {
    pageNumber: 0,
    pageSize: 20,
    totalElements: 2,
    totalPages: 1,
    userActivated: true,
    projects: [MOCK_PROJECT_1, MOCK_PROJECT_2],
    _links: {
        self: {
            href: 'http://where.ever.com'
        },
        create: {
            href: ''
        },
    }
};

export const TEST_PROJECT_LIST_ONE_OF_TWO_PAGE: ProjectListResource = {
    pageNumber: 0,
    pageSize: 1,
    totalElements: 2,
    totalPages: 2,
    userActivated: true,
    projects: [MOCK_PROJECT_1],
    _links: {
        self: {
            href: 'http://where.ever.com'
        },
        create: {
            href: ''
        },
    }
};

export const TEST_PROJECT_LIST_TWO_OF_TWO_PAGE: ProjectListResource = {
    pageNumber: 1,
    pageSize: 1,
    totalElements: 2,
    totalPages: 2,
    userActivated: true,
    projects: [MOCK_PROJECT_2],
    _links: {
        self: {
            href: 'http://where.ever.com'
        },
        create: {
            href: ''
        },
    }
};

export const TEST_PROJECT_LIST_EMPTY: ProjectListResource = {
    pageNumber: 0,
    pageSize: 1,
    totalElements: 0,
    totalPages: 0,
    userActivated: true,
    projects: [],
    _links: {
        self: {
            href: 'http://where.ever.com'
        },
        create: {
            href: ''
        },
    }
};
