/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractEntity} from '../../../../shared/misc/store/datatypes/abstract-entity.datatype';
import {
    ConstraintKey,
    ConstraintResource
} from '../../api/constraints/resources/constraint.resource';

export class ConstraintEntity extends AbstractEntity {
    key: ConstraintKey;
    name: string;
    active: boolean;
    permissions: ConstraintEntityPermissions;

    public static fromConstraintResource(constraintResource: ConstraintResource): ConstraintEntity {
        const {
            key,
            name,
            active,
        } = constraintResource;

        return {
            key,
            name,
            active,
            id: key,
            requestStatus: RequestStatusEnum.empty,
            permissions: ConstraintEntity._mapLinksToPermissions(constraintResource),
        };
    }

    private static _mapLinksToPermissions(constraintResource: ConstraintResource): ConstraintEntityPermissions {
        const {_links} = constraintResource;

        return {
            canActivate: _links.hasOwnProperty('activate'),
            canDeactivate: _links.hasOwnProperty('deactivate'),
            canUpdate: _links.hasOwnProperty('update'),
        };
    }

}

interface ConstraintEntityPermissions {
    canActivate: boolean;
    canDeactivate: boolean;
    canUpdate: boolean;
}
