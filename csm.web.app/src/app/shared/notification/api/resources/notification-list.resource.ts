/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../misc/api/datatypes/resource-link.datatype';
import {ResourceLinkTemplated} from '../../../misc/api/datatypes/resource-link-templated.datatype';
import {NotificationResource} from './notification.resource';

export class NotificationListResource {
    public items: NotificationResource[];
    public lastSeen: string;
    public _links: NotificationListLinks;
}

export class NotificationListLinks {
    self: ResourceLinkTemplated;
    prev?: ResourceLink;
}
