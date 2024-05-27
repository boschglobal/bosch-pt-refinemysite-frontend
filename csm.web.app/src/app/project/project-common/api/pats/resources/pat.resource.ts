/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {AbstractAuditableResource} from '../../../../../shared/misc/api/resources/abstract-auditable.resource';

export class PATResource extends AbstractAuditableResource {
    public description?: string;
    public expiresAt: string;
    public impersonatedUser: string;
    public issuedAt: string;
    public scopes: PATScope[];
    public token?: string;
    public type: string;
    public _links: PATResourceLinks;
}

export class PATResourceLinks {
    public self?: ResourceLink;
}

export type PATScope = 'TIMELINE_API_READ' | 'GRAPHQL_API_READ';
