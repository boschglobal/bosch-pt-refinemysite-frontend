/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {ResourceReference} from '../../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {AbstractAuditableResource} from '../../../../../shared/misc/api/resources/abstract-auditable.resource';

export class ProjectCraftResource extends AbstractAuditableResource {
    public name: string;
    public color: string;
    public position: number;
    public project: ResourceReference;
    public _links?: ProjectCraftResourceLinks;
}

export class ProjectCraftResourceLinks {
    public self: ResourceLink;
    public project: ResourceLink;
    public delete?: ResourceLink;
    public update?: ResourceLink;
}
