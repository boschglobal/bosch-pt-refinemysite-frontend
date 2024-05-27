/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {ConstraintResource} from '../../app/project/project-common/api/constraints/resources/constraint.resource';
import {SaveConstraintResource} from '../../app/project/project-common/api/constraints/resources/save-constraint.resource';
import {ConstraintEntity} from '../../app/project/project-common/entities/constraints/constraint';

export const MOCK_CONSTRAINT_WITH_DEACTIVATE_PERMISSION: ConstraintResource = {
    key: 'RESOURCES',
    name: 'Resources',
    active: true,
    _links: {
        deactivate: {href: 'deactivate'},
    },
};

export const MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION: ConstraintResource = {
    key: 'INFORMATION',
    name: 'Information',
    active: true,
    _links: {
        activate: {href: 'activate'},
    },
};

export const MOCK_CONSTRAINT_WITH_UPDATE_PERMISSION: ConstraintResource = {
    key: 'EQUIPMENT',
    name: 'Equipment',
    active: true,
    _links: {
        update: {href: 'update'},
    },
};

export const MOCK_SAVE_CONSTRAINT_RESOURCE: SaveConstraintResource = {
    key: 'EQUIPMENT',
    active: true,
    name: 'foo',
};

export const MOCK_CONSTRAINT_WITH_DEACTIVATE_PERMISSION_ENTITY =
    ConstraintEntity.fromConstraintResource(MOCK_CONSTRAINT_WITH_DEACTIVATE_PERMISSION);
export const MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION_ENTITY =
    ConstraintEntity.fromConstraintResource(MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION);
export const MOCK_CONSTRAINT_WITH_UPDATE_PERMISSION_ENTITY =
    ConstraintEntity.fromConstraintResource(MOCK_CONSTRAINT_WITH_UPDATE_PERMISSION);
