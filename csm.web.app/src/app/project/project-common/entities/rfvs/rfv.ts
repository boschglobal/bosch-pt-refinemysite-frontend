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
    RfvKey,
    RfvResource
} from '../../api/rfvs/resources/rfv.resource';

export class RfvEntity extends AbstractEntity {
    key: RfvKey;
    name: string;
    active: boolean;
    permissions: RfvEntityPermissions;

    public static fromRfvResource(rfvResource: RfvResource): RfvEntity {
        const {
            key,
            name,
            active,
        } = rfvResource;

        return {
            key,
            name,
            active,
            id: key,
            requestStatus: RequestStatusEnum.empty,
            permissions: RfvEntity._mapLinksToPermissions(rfvResource),
        };
    }

    private static _mapLinksToPermissions(rfvResource: RfvResource): RfvEntityPermissions {
        const links = rfvResource._links;

        return {
            canActivate: links.hasOwnProperty('activate'),
            canDeactivate: links.hasOwnProperty('deactivate'),
            canUpdate: links.hasOwnProperty('update'),
        };
    }

}

interface RfvEntityPermissions {
    canActivate: boolean;
    canDeactivate: boolean;
    canUpdate: boolean;
}
