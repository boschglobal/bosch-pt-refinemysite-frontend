/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../shared/misc/api/datatypes/resource-link.datatype';
import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {AbstractAuditableResource} from '../../../../shared/misc/api/resources/abstract-auditable.resource';

export class ProjectPictureResource extends AbstractAuditableResource {
    public width: number;
    public height: number;
    public fileSize: number;
    public projectReference: ResourceReference;
    public _links?: ProjectPictureResourceLinks;
}

class ProjectPictureResourceLinks {
    public delete?: ResourceLink;
    public self: ResourceLink;
    public small: ResourceLink;
    public full: ResourceLink;
}
