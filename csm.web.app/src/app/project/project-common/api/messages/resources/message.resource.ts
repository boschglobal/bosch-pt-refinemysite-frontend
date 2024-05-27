/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {AbstractAuditableResource} from '../../../../../shared/misc/api/resources/abstract-auditable.resource';
import {AttachmentListResource} from '../../attachments/resources/attachment-list.resource';

export class MessageResource extends AbstractAuditableResource {
    public topicId: string;
    public content?: string;
    public _links: MessageResourceLinks;
    public _embedded: MessageResourceEmbeddeds;
}

class MessageResourceLinks {
    public self: ResourceLink;
    public delete?: ResourceLink;
}

class MessageResourceEmbeddeds {
    public attachments?: AttachmentListResource;
}
