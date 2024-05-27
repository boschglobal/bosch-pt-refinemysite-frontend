/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {SaveMilestoneFilters} from '../../app/project/project-common/api/milestones/resources/save-milestone-filters';
import {ProjectFiltersCriteriaResource} from '../../app/project/project-common/api/misc/resources/project-filters-criteria.resource';
import {SaveProjectFiltersCriteriaResource} from '../../app/project/project-common/api/misc/resources/save-project-filters-criteria.resource';
import {QuickFilterResource} from '../../app/project/project-common/api/quick-filters/resources/quick-filter.resource';
import {QuickFilterListResource} from '../../app/project/project-common/api/quick-filters/resources/quick-filter-list.resource';
import {SaveQuickFilterResource} from '../../app/project/project-common/api/quick-filters/resources/save-quick-filter.resource';
import {MilestoneFilters} from '../../app/project/project-common/store/milestones/slice/milestone-filters';
import {MilestoneFiltersCriteria} from '../../app/project/project-common/store/milestones/slice/milestone-filters-criteria';
import {ProjectTaskFilters} from '../../app/project/project-common/store/tasks/slice/project-task-filters';
import {ProjectTaskFiltersCriteria} from '../../app/project/project-common/store/tasks/slice/project-task-filters-criteria';
import {SaveProjectTaskFilters} from '../../app/project/project-common/store/tasks/slice/save-project-task-filters';
import {ResourceReference} from '../../app/shared/misc/api/datatypes/resource-reference.datatype';
import {TEST_USER_RESOURCE_REGISTERED} from './user';

export const MOCK_QUICK_FILTER_RESOURCE: QuickFilterResource = {
    id: 'quick-filter-id',
    version: 1,
    name: 'Quick filter name',
    criteria: new ProjectFiltersCriteriaResource(),
    useTaskCriteria: true,
    useMilestoneCriteria: true,
    highlight: false,
    createdBy: new ResourceReference(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName),
    createdDate: '2019-12-19T00:00:00.000Z',
    lastModifiedBy: new ResourceReference(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName),
    lastModifiedDate: '2019-12-20T00:00:00.000Z',
    _links: {
        update: {href: 'update'},
        delete: {href: 'delete'},
    },
};

export const MOCK_QUICK_FILTER_WITH_DATE_CRITERIA: QuickFilterResource = {
    id: 'quick-filter-id-with-dates',
    version: 1,
    name: 'Quick filter name with dates',
    criteria: Object.assign(new ProjectFiltersCriteriaResource(), {
        tasks: Object.assign(new ProjectTaskFiltersCriteria(), {
            from: moment('2019-12-19'),
            to: moment('2020-03-19'),
        }),
        milestones: Object.assign(new MilestoneFiltersCriteria(), {
            from: moment('2019-12-19'),
            to: moment('2020-03-19'),
        }),
    }),
    useTaskCriteria: true,
    useMilestoneCriteria: true,
    highlight: false,
    createdBy: new ResourceReference(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName),
    createdDate: '2019-12-19T00:00:00.000Z',
    lastModifiedBy: new ResourceReference(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName),
    lastModifiedDate: '2019-12-20T00:00:00.000Z',
    _links: {
        update: {href: 'update'},
        delete: {href: 'delete'},
    },
};

export const MOCK_QUICK_FILTER_WITHOUT_PERMISSIONS: QuickFilterResource = {
    id: 'quick-filter-id-without-permissions',
    version: 1,
    name: 'Quick filter name without permissions',
    criteria: new ProjectFiltersCriteriaResource(),
    useTaskCriteria: true,
    useMilestoneCriteria: true,
    highlight: false,
    createdBy: new ResourceReference(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName),
    createdDate: '2019-12-19T00:00:00.000Z',
    lastModifiedBy: new ResourceReference(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName),
    lastModifiedDate: '2019-12-20T00:00:00.000Z',
    _links: {},
};

export const MOCK_SAVE_QUICK_FILTER: SaveQuickFilterResource = {
    name: 'Quick filter name',
    highlight: false,
    useTaskCriteria: true,
    useMilestoneCriteria: true,
    criteria: Object.assign(new SaveProjectFiltersCriteriaResource(), {
        tasks: SaveProjectTaskFilters.fromProjectTaskFilters(new ProjectTaskFilters()),
        milestones: SaveMilestoneFilters.fromMilestoneFilters(new MilestoneFilters()),
    }),
};

export const MOCK_QUICK_FILTER_LIST: QuickFilterListResource = {
    items: [
        MOCK_QUICK_FILTER_RESOURCE,
    ],
    _links: {
        self: {href: 'self'},
        create: {href: 'create'},
    },
};
