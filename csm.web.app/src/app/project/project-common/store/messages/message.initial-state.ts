/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {MessageListResourceLinks} from '../../api/messages/resources/message-list.resource';
import {MessageSlice} from './message.slice';

export function lists() {
    return new Map<string, AbstractList<MessageListResourceLinks>>();
}

export const MESSAGE_SLICE_INITIAL_STATE: MessageSlice = {
    items: [],
    lists: new Map<string, AbstractList<MessageListResourceLinks>>()
};

