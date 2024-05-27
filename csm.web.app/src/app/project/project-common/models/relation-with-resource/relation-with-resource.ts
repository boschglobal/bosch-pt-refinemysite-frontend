/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RelationResource} from '../../api/relations/resources/relation.resource';

export class RelationWithResource<T> {
    public id: string;
    public version: number;
    public permissions: RelationWithResourcePermissions;
    public resource: T;
    public type: ObjectTypeEnum;
    public critical?: boolean;

    public static fromRelationAndResource<U>(resource: U, relation: RelationResource, type: ObjectTypeEnum): RelationWithResource<U> {
        const {id, version, critical, _links} = relation;

        return {
            id,
            version,
            critical,
            resource,
            type,
            permissions: {
                canDelete: _links.hasOwnProperty('delete'),
            },
        };
    }
}

interface RelationWithResourcePermissions {
    canDelete: boolean;
}
