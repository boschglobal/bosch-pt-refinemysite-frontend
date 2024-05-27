/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {RelationResource} from '../../app/project/project-common/api/relations/resources/relation.resource';
import {RelationListResource} from '../../app/project/project-common/api/relations/resources/relation-list.resource';
import {SaveRelationResource} from '../../app/project/project-common/api/relations/resources/save-relation.resource';
import {SaveRelationFilters} from '../../app/project/project-common/api/relations/resources/save-relation-filters';
import {RelationTypeEnum} from '../../app/project/project-common/enums/relation-type.enum';
import {ObjectIdentifierPair} from '../../app/shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ResourceReference} from '../../app/shared/misc/api/datatypes/resource-reference.datatype';
import {AbstractItemsResource} from '../../app/shared/misc/api/resources/abstract-items.resource';
import {ObjectTypeEnum} from '../../app/shared/misc/enums/object-type.enum';
import {TEST_USER_RESOURCE_REGISTERED} from './user';

export const MOCK_RELATION_RESOURCE_1: RelationResource = {
    id: 'relation-1',
    version: 0,
    type: RelationTypeEnum.PartOf,
    source: new ObjectIdentifierPair(ObjectTypeEnum.Task, 'task-1'),
    target: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, 'milestone-1'),
    critical: true,
    createdBy: new ResourceReference(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName),
    createdDate: '2021-09-08T00:00:00.000Z',
    lastModifiedBy: new ResourceReference(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName),
    lastModifiedDate: '2021-09-08T00:00:00.000Z',
    _links: {
        self: {href: 'self'},
        delete: {href: 'delete'},
    },
};

export const MOCK_RELATION_RESOURCE_2: RelationResource = {
    id: 'relation-2',
    version: 0,
    type: RelationTypeEnum.FinishToStart,
    source: new ObjectIdentifierPair(ObjectTypeEnum.Task, 'task-2'),
    target: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, 'milestone-2'),
    createdBy: new ResourceReference(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName),
    createdDate: '2021-09-08T00:00:00.000Z',
    lastModifiedBy: new ResourceReference(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName),
    lastModifiedDate: '2021-09-08T00:00:00.000Z',
    _links: {
        self: {href: 'self'},
    },
};

export const MOCK_RELATION_RESOURCE_3: RelationResource = {
    id: 'relation-3',
    version: 0,
    type: RelationTypeEnum.FinishToStart,
    source: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, 'milestone-3'),
    target: new ObjectIdentifierPair(ObjectTypeEnum.Task, 'task-3'),
    createdBy: new ResourceReference(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName),
    createdDate: '2021-09-08T00:00:00.000Z',
    lastModifiedBy: new ResourceReference(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName),
    lastModifiedDate: '2021-09-08T00:00:00.000Z',
    _links: {
        self: {href: 'self'},
        delete: {href: 'delete'},
    },
};

export const MOCK_RELATION_RESOURCE_4: RelationResource = {
    id: 'relation-4',
    version: 0,
    type: RelationTypeEnum.FinishToStart,
    critical: true,
    source: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, 'milestone-3'),
    target: new ObjectIdentifierPair(ObjectTypeEnum.Task, 'task-3'),
    createdBy: new ResourceReference(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName),
    createdDate: '2021-09-08T00:00:00.000Z',
    lastModifiedBy: new ResourceReference(TEST_USER_RESOURCE_REGISTERED.id, TEST_USER_RESOURCE_REGISTERED.firstName),
    lastModifiedDate: '2021-09-08T00:00:00.000Z',
    _links: {
        self: {href: 'self'},
        delete: {href: 'delete'},
    },
};

export const MOCK_SAVE_RELATION_RESOURCE_1: SaveRelationResource = {
    type: RelationTypeEnum.FinishToStart,
    source: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, 'milestone-4'),
    target: new ObjectIdentifierPair(ObjectTypeEnum.Task, 'task-4'),
};

export const MOCK_SAVE_RELATION_RESOURCE_2: SaveRelationResource = {
    type: RelationTypeEnum.PartOf,
    source: new ObjectIdentifierPair(ObjectTypeEnum.Task, 'task-5'),
    target: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, 'milestone-4'),
};

export const MOCK_RELATION_LIST_RESOURCE_PAGE_ONE_OF_ONE: RelationListResource = {
    items: [
        MOCK_RELATION_RESOURCE_1,
        MOCK_RELATION_RESOURCE_2,
    ],
    pageNumber: 0,
    pageSize: 2,
    totalPages: 1,
    totalElements: 2,
    _links: {
        self: {href: 'self'},
    },
};

export const MOCK_RELATION_LIST_RESOURCE_PAGE_ONE_OF_TWO: RelationListResource = {
    items: [
        MOCK_RELATION_RESOURCE_1,
        MOCK_RELATION_RESOURCE_2,
    ],
    pageNumber: 0,
    pageSize: 2,
    totalPages: 2,
    totalElements: 3,
    _links: {
        self: {href: 'self'},
    },
};

export const MOCK_RELATION_LIST_RESOURCE_PAGE_TWO_OF_TWO: RelationListResource = {
    items: [
        MOCK_RELATION_RESOURCE_3,
    ],
    pageNumber: 1,
    pageSize: 2,
    totalPages: 2,
    totalElements: 3,
    _links: {
        self: {href: 'self'},
    },
};

export const MOCK_SAVE_RELATION_FILTERS_1: SaveRelationFilters = {
    types: [RelationTypeEnum.FinishToStart],
    sources: [new ObjectIdentifierPair(ObjectTypeEnum.Milestone, 'milestone-1')],
    targets: [new ObjectIdentifierPair(ObjectTypeEnum.Task, 'task-1')],
};

export const MOCK_ABSTRACT_RELATION_LIST: AbstractItemsResource<RelationResource> = {
    items: [
        MOCK_RELATION_RESOURCE_1,
        MOCK_RELATION_RESOURCE_2,
    ],
    _links: {
        self: {href: 'self'},
    },
};
