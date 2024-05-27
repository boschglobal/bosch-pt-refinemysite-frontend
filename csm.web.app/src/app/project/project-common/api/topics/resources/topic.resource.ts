/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {AbstractAuditableResource} from '../../../../../shared/misc/api/resources/abstract-auditable.resource';
import {TopicCriticalityEnum} from '../../../enums/topic-criticality.enum';
import {AttachmentListResource} from '../../attachments/resources/attachment-list.resource';

export class TopicResource extends AbstractAuditableResource {
    public description?: string;
    public taskId: string;
    public criticality: TopicCriticalityEnum;
    public messages: number;
    public _links?: TopicLinks;
    public _embedded: TopicEmbedded;
}

class TopicLinks {
    public self: ResourceLink;
    public deescalate?: ResourceLink;
    public delete?: ResourceLink;
    public escalate?: ResourceLink;
}

export class TopicEmbedded {
    attachments: AttachmentListResource;
}
