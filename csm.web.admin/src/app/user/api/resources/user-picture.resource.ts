/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceReference} from '../../../shared/misc/api/datatypes/resource-reference.datatype';
import {AbstractAuditableResource} from '../../../shared/misc/api/resources/abstract-auditable.resource';
import {ResourceLink} from '../../../shared/misc/api/datatypes/resource-link.datatype';

export class UserPictureResource extends AbstractAuditableResource {
    public width: number;
    public height: number;
    public fileSize: number;
    public userReference: ResourceReference;
    public _links: UserPictureResourceLinks;
}

class UserPictureResourceLinks {
    public self: ResourceLink;
    public small: ResourceLink;
    public full: ResourceLink;
    public delete?: ResourceLink;
}
