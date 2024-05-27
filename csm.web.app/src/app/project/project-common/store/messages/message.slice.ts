/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {MessageResource} from '../../api/messages/resources/message.resource';
import {MessageListResourceLinks} from '../../api/messages/resources/message-list.resource';

export interface MessageSlice {
    items: MessageResource[];
    lists: Map<string, AbstractList<MessageListResourceLinks>>;
}
