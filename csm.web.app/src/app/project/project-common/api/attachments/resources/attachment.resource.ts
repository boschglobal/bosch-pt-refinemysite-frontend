/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceLinkTemplated} from '../../../../../shared/misc/api/datatypes/resource-link-templated.datatype';
import {AbstractAuditableResource} from '../../../../../shared/misc/api/resources/abstract-auditable.resource';

export class AttachmentResource extends AbstractAuditableResource {
    public captureDate?: string;
    public fileName: string;
    public fileSize: number;
    public imageHeight?: number;
    public imageWidth?: number;
    public messageId?: string;
    public topicId?: string;
    public taskId?: string;
    public _links: AttachmentResourceLinks;
}

class AttachmentResourceLinks {
    public self: ResourceLinkTemplated;
    public preview: ResourceLinkTemplated;
    public data: ResourceLinkTemplated;
    public original: ResourceLinkTemplated;
    public delete?: ResourceLinkTemplated;
}
