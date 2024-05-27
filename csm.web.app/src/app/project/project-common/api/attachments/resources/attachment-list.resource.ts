/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {AttachmentResource} from './attachment.resource';

export class AttachmentListResource {
    public attachments: AttachmentResource[];
    public _links: AttachmentListResourceLinks;
}

export class AttachmentListResourceLinks {
    public self: ResourceLink;
}
