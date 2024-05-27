/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {MilestoneResource} from '../../app/project/project-common/api/milestones/resources/milestone.resource';
import {MilestoneListResource} from '../../app/project/project-common/api/milestones/resources/milestone-list.resource';
import {SaveMilestoneResource} from '../../app/project/project-common/api/milestones/resources/save-milestone.resource';
import {MilestoneFormData} from '../../app/project/project-common/containers/milestone-capture/milestone-capture.component';
import {MilestoneTypeEnum} from '../../app/project/project-common/enums/milestone-type.enum';
import {Milestone} from '../../app/project/project-common/models/milestones/milestone';
import {MilestoneFilters} from '../../app/project/project-common/store/milestones/slice/milestone-filters';
import {MilestoneFiltersCriteria} from '../../app/project/project-common/store/milestones/slice/milestone-filters-criteria';
import {ProjectCraftResourceReference} from '../../app/shared/misc/api/datatypes/project-craft-resource-reference.datatype';
import {ResourceReference} from '../../app/shared/misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../../app/shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {MOCK_PROJECT_CRAFT_A} from './crafts';
import {MOCK_PROJECT_1} from './projects';
import {TEST_USER_RESOURCE_REGISTERED} from './user';
import {MOCK_WORKAREA_A} from './workareas';

export const MOCK_MILESTONE_RESOURCE_HEADER: MilestoneResource = {
    id: 'milestone-1',
    version: 1,
    project: new ResourceReference(MOCK_PROJECT_1.id, MOCK_PROJECT_1.title),
    name: 'Finish everything',
    type: MilestoneTypeEnum.Investor,
    date: new Date('2020-11-21'),
    header: true,
    creator: new ResourceReferenceWithPicture(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName, 'picture'),
    position: 2,
    craft: null,
    workArea: null,
    description: 'Just a description 1',
    _links: {
        self: {href: 'self'},
        update: {href: 'update'},
        delete: {href: 'delete'},
    },
    createdBy: new ResourceReference(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName),
    createdDate: '2019-12-19T00:00:00.000Z',
    lastModifiedBy: new ResourceReference(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName),
    lastModifiedDate: '2019-12-20T00:00:00.000Z',
};

export const MOCK_MILESTONE_HEADER = Milestone.fromMilestoneResource(MOCK_MILESTONE_RESOURCE_HEADER);

export const MOCK_MILESTONE_RESOURCE_HEADER_WITH_WORKAREA: MilestoneResource = {
    id: 'milestone-1',
    version: 1,
    project: new ResourceReference(MOCK_PROJECT_1.id, MOCK_PROJECT_1.title),
    name: 'Finish everything',
    type: MilestoneTypeEnum.Investor,
    date: new Date('2020-11-21'),
    header: true,
    creator: new ResourceReferenceWithPicture(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName, 'picture'),
    position: 2,
    craft: null,
    workArea: new ResourceReference(MOCK_WORKAREA_A.id, MOCK_WORKAREA_A.name),
    description: 'Just a description 1',
    _links: {
        self: {href: 'self'},
        update: {href: 'update'},
        delete: {href: 'delete'},
    },
    createdBy: new ResourceReference(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName),
    createdDate: '2019-12-19T00:00:00.000Z',
    lastModifiedBy: new ResourceReference(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName),
    lastModifiedDate: '2019-12-20T00:00:00.000Z',
};

export const MOCK_MILESTONE_HEADER_WITH_WORKAREA = Milestone.fromMilestoneResource(MOCK_MILESTONE_RESOURCE_HEADER_WITH_WORKAREA);

export const MOCK_SAVE_MILESTONE = SaveMilestoneResource.fromMilestone(MOCK_MILESTONE_HEADER);

export const MOCK_MILESTONE_HEADER_FORM_DATA: MilestoneFormData = {
    date: moment('2020-11-21'),
    type: {
        marker: {
            type: MilestoneTypeEnum.Investor,
        },
    },
    description: 'Just a description 1',
    location: 'header',
    title: 'Milestone 1',
};

export const MOCK_MILESTONE_RESOURCE_CRAFT: MilestoneResource = {
    id: 'milestone-2',
    version: 1,
    project: new ResourceReference(MOCK_PROJECT_1.id, MOCK_PROJECT_1.title),
    name: 'Finish the craft',
    type: MilestoneTypeEnum.Craft,
    date: new Date('2020-10-21'),
    header: false,
    creator: new ResourceReferenceWithPicture(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName, 'picture'),
    position: 1,
    craft: new ProjectCraftResourceReference(MOCK_PROJECT_CRAFT_A.id, MOCK_PROJECT_CRAFT_A.name, MOCK_PROJECT_CRAFT_A.color),
    workArea: null,
    description: 'Just a description 2',
    _links: {
        self: {href: 'self'},
        update: {href: 'update'},
        delete: {href: 'delete'},
    },
    createdBy: new ResourceReference(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName),
    createdDate: '2019-12-21T00:00:00.000Z',
    lastModifiedBy: new ResourceReference(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName),
    lastModifiedDate: '2019-12-22T00:00:00.000Z',
};

export const MOCK_MILESTONE_CRAFT = Milestone.fromMilestoneResource(MOCK_MILESTONE_RESOURCE_CRAFT);

export const MOCK_MILESTONE_CRAFT_FORM_DATA: MilestoneFormData = {
    date: moment('2020-10-21'),
    type: {
        marker: {
            type: MilestoneTypeEnum.Craft,
            color: MOCK_PROJECT_CRAFT_A.color,
        },
        craftId: MOCK_PROJECT_CRAFT_A.id,
    },
    description: 'Just a description 2',
    location: 'no-row',
    title: 'Milestone 2',
};

export const MOCK_MILESTONE_RESOURCE_WORKAREA: MilestoneResource = {
    id: 'milestone-3',
    version: 1,
    project: new ResourceReference(MOCK_PROJECT_1.id, MOCK_PROJECT_1.title),
    name: 'Finish this workarea',
    type: MilestoneTypeEnum.Project,
    date: new Date('2020-12-21'),
    header: false,
    creator: new ResourceReferenceWithPicture(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName, 'picture'),
    position: 0,
    craft: null,
    workArea: new ResourceReference(MOCK_WORKAREA_A.id, MOCK_WORKAREA_A.name),
    description: 'Just a description 3',
    _links: {
        self: {href: 'self'},
        update: {href: 'update'},
        delete: {href: 'delete'},
    },
    createdBy: new ResourceReference(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName),
    createdDate: '2019-12-23T00:00:00.000Z',
    lastModifiedBy: new ResourceReference(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName),
    lastModifiedDate: '2019-12-24T00:00:00.000Z',
};

export const MOCK_MILESTONE_WORKAREA = Milestone.fromMilestoneResource(MOCK_MILESTONE_RESOURCE_WORKAREA);

export const MOCK_MILESTONE_WORKAREA_FORM_DATA: MilestoneFormData = {
    date: moment('2020-12-21'),
    type: {
        marker: {
            type: MilestoneTypeEnum.Project,
        },
    },
    description: 'Just a description 3',
    location: MOCK_WORKAREA_A.id,
    title: 'Milestone 3',
};

export const MOCK_MILESTONE_RESOURCE_WITHOUT_PERMISSIONS: MilestoneResource = {
    id: 'milestone-4',
    version: 1,
    project: new ResourceReference(MOCK_PROJECT_1.id, MOCK_PROJECT_1.title),
    name: 'Finish this workarea',
    type: MilestoneTypeEnum.Project,
    date: new Date('2020-12-21'),
    header: false,
    creator: new ResourceReferenceWithPicture(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName, 'picture'),
    position: 0,
    craft: null,
    workArea: new ResourceReference(MOCK_WORKAREA_A.id, MOCK_WORKAREA_A.name),
    description: 'Just a description 4',
    _links: {
        self: {href: 'self'},
    },
    createdBy: new ResourceReference(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName),
    createdDate: '2019-12-27T00:00:00.000Z',
    lastModifiedBy: new ResourceReference(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName),
    lastModifiedDate: '2019-12-28T00:00:00.000Z',
};

export const MOCK_MILESTONE_WITHOUT_PERMISSIONS = Milestone.fromMilestoneResource(MOCK_MILESTONE_RESOURCE_WITHOUT_PERMISSIONS);

export const MOCK_MILESTONE_LIST: MilestoneListResource = {
    pageNumber: 0,
    pageSize: 20,
    totalElements: 2,
    totalPages: 1,
    items: [
        MOCK_MILESTONE_RESOURCE_HEADER,
        MOCK_MILESTONE_RESOURCE_WORKAREA,
    ],
    _links: {
        self: {href: 'self'},
        createCraftMilestone: {href: 'createCraftMilestone'},
        createInvestorMilestone: {href: 'createInvestorMilestone'},
        createProjectMilestone: {href: 'createProjectMilestone'},
    },
};

export const MOCK_MILESTONE_LIST_ONE_OF_ONE_PAGE: MilestoneListResource = {
    pageNumber: 0,
    pageSize: 20,
    totalElements: 2,
    totalPages: 1,
    items: [
        MOCK_MILESTONE_RESOURCE_HEADER,
        MOCK_MILESTONE_RESOURCE_WORKAREA,
    ],
    _links: {
        self: {href: 'self'},
        createCraftMilestone: {href: 'createCraftMilestone'},
        createInvestorMilestone: {href: 'createInvestorMilestone'},
        createProjectMilestone: {href: 'createProjectMilestone'},
    },
};

export const MOCK_MILESTONE_LIST_ONE_OF_TWO_PAGE: MilestoneListResource = {
    pageNumber: 0,
    pageSize: 1,
    totalElements: 2,
    totalPages: 2,
    items: [
        MOCK_MILESTONE_RESOURCE_HEADER,
    ],
    _links: {
        self: {href: 'self'},
        createCraftMilestone: {href: 'createCraftMilestone'},
        createInvestorMilestone: {href: 'createInvestorMilestone'},
        createProjectMilestone: {href: 'createProjectMilestone'},
    },
};

export const MOCK_MILESTONE_LIST_TWO_OF_TWO_PAGE: MilestoneListResource = {
    pageNumber: 1,
    pageSize: 1,
    totalElements: 2,
    totalPages: 2,
    items: [
        MOCK_MILESTONE_RESOURCE_WORKAREA,
    ],
    _links: {
        self: {href: 'self'},
        createCraftMilestone: {href: 'createCraftMilestone'},
        createInvestorMilestone: {href: 'createInvestorMilestone'},
        createProjectMilestone: {href: 'createProjectMilestone'},
    },
};

export const MOCK_MILESTONE_LIST_EMPTY: MilestoneListResource = {
    pageNumber: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0,
    items: [],
    _links: {
        self: {href: 'self'},
        createCraftMilestone: {href: 'createCraftMilestone'},
        createInvestorMilestone: {href: 'createInvestorMilestone'},
        createProjectMilestone: {href: 'createProjectMilestone'},
    },
};

export const MOCK_MILESTONE_FILTERS_CRITERIA: MilestoneFiltersCriteria = {
    from: moment(),
    to: moment(),
    types: {
        types: [MilestoneTypeEnum.Project],
        projectCraftIds: [],
    },
    workAreas: {
        workAreaIds: ['wa-1'],
        header: false,
    },
};

export const MOCK_MILESTONE_FILTERS: MilestoneFilters = new MilestoneFilters(MOCK_MILESTONE_FILTERS_CRITERIA);
