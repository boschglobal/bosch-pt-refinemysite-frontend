/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {MessageResource} from './message.resource';

export class MessageListResource {
    public messages: MessageResource[] = [];
    public _links: MessageListResourceLinks;
}

export class MessageListResourceLinks {
    public self: ResourceLink;
    public prev?: ResourceLink;
}
