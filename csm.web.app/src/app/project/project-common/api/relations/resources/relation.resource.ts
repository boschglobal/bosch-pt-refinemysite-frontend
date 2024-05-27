/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {ObjectIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {AbstractAuditableResource} from '../../../../../shared/misc/api/resources/abstract-auditable.resource';
import {RelationTypeEnum} from '../../../enums/relation-type.enum';

export class RelationResource extends AbstractAuditableResource {
    public type: RelationTypeEnum;
    public source: ObjectIdentifierPair;
    public target: ObjectIdentifierPair;
    public critical?: boolean;
    public _links: RelationLinks;
}

export class RelationLinks {
    public self: ResourceLink;
    public delete?: ResourceLink;
}
