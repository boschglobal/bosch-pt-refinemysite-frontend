/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ActionReducer} from '@ngrx/store';
import {
    union,
    unionBy,
    without
} from 'lodash';

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {MessageResource} from '../../api/messages/resources/message.resource';
import {MessageListResourceLinks} from '../../api/messages/resources/message-list.resource';
import {
    MessageActionEnum,
    MessageActions
} from './message.actions';
import {MESSAGE_SLICE_INITIAL_STATE} from './message.initial-state';
import {MessageSlice} from './message.slice';

export function messageReducer(state: MessageSlice = MESSAGE_SLICE_INITIAL_STATE, action: MessageActions): MessageSlice {
    switch (action.type) {

        case MessageActionEnum.InitializeAll:
            return MESSAGE_SLICE_INITIAL_STATE;

        case MessageActionEnum.InitializeAllByTopic: {
            const removeMessagesByTopicPayload = action as MessageActions.Initialize.AllByTopic;
            const topicId = removeMessagesByTopicPayload.payload;
            const lists = typeof state.lists === 'undefined' ? new Map<string, AbstractList<MessageListResourceLinks>>() : state.lists;
            return Object.assign({}, state, {
                items: state.items.filter(item => item.topicId !== topicId),
                lists: Object.assign(new Map(), lists,
                    {
                        [topicId]: new AbstractList(),
                    }
                ),
            });
        }

        case MessageActionEnum.CreateOneFulfilled: {
            const postMessageFulfilledAction = action as MessageActions.Create.OneFulfilled;
            const message = postMessageFulfilledAction.payload;
            const postMessageFulfilled = {
                id: message.id,
                ids: state.lists[message.topicId] ? state.lists[message.topicId].ids : [],
                topicId: message.topicId,
            };

            return Object.assign({}, state, {
                items: unionBy([message], state.items, 'id'),
                lists: Object.assign(new Map(), state.lists, {
                    [postMessageFulfilled.topicId]:
                            Object.assign(new AbstractList(), state.lists[postMessageFulfilled.topicId], {
                                ids: union([postMessageFulfilled.id], postMessageFulfilled.ids),
                                requestStatus: RequestStatusEnum.success,
                            }),
                }
                ),
            });
        }

        case MessageActionEnum.DeleteOneReset: {
            const deleteOneMessageReset = action as MessageActions.Delete.OneReset;

            const topicId = deleteOneMessageReset.payload;
            const lists = typeof state.lists === 'undefined' ? new Map<string, AbstractList<MessageListResourceLinks>>() : state.lists;

            return Object.assign({}, state, {
                lists: Object.assign(new Map(), lists,
                    {
                        [topicId]:
                            Object.assign(
                                new AbstractList(),
                                lists[topicId],
                                {requestStatus: RequestStatusEnum.empty}
                            ),
                    }
                ),
            });
        }

        case MessageActionEnum.DeleteOneFulfilled: {
            const deleteOneFulfilledAction = action as MessageActions.Delete.OneFulfilled;
            const {topicId, messageId} = deleteOneFulfilledAction.payload;
            const lists = typeof state.lists === 'undefined' ? new Map<string, AbstractList<MessageListResourceLinks>>() : state.lists;

            return Object.assign({}, state, {
                items: state.items.filter(item => item.id !== messageId),
                lists: Object.assign(new Map(), lists,
                    {
                        [topicId]:
                            Object.assign(
                                new AbstractList(),
                                lists[topicId],
                                {
                                    ids: without(lists[topicId].ids, messageId),
                                    requestStatus: RequestStatusEnum.success,
                                }
                            ),
                    }
                ),
            });
        }

        case MessageActionEnum.DeleteOne:
        case MessageActionEnum.CreateOne:
        case MessageActionEnum.RequestAll: {
            const lists = typeof state.lists === 'undefined' ? new Map<string, AbstractList<MessageListResourceLinks>>() : state.lists;

            return Object.assign({}, state, {
                lists: Object.assign(new Map(), lists,
                    {
                        [action.payload.topicId]:
                            Object.assign(
                                new AbstractList(),
                                lists[action.payload.topicId],
                                {requestStatus: RequestStatusEnum.progress}
                            ),
                    }
                ),
            });
        }

        case MessageActionEnum.RequestAllFulfilled: {
            const requestAllMessagesFulfilledAction = action as MessageActions.Request.AllFulfilled;
            const {topicId, messageList} = requestAllMessagesFulfilledAction.payload;
            const messageIds: string[] = state.lists[topicId] ? state.lists[topicId].ids : [];
            const list = typeof state.lists[topicId] === 'undefined' ? new AbstractList<MessageListResourceLinks>() : state.lists[topicId];

            return Object.assign({}, state, {
                items: unionBy(messageList.messages, state.items, 'id'),
                lists: Object.assign(new Map(), state.lists, {
                    [topicId]:
                            Object.assign(new AbstractList(), list, {
                                ids: union(messageIds, messageList.messages.map((message: MessageResource) => message.id)),
                                requestStatus: RequestStatusEnum.success,
                                _links: messageList._links,
                            }),
                }
                ),
            });
        }

        case MessageActionEnum.CreateOneRejected:
        case MessageActionEnum.DeleteOneRejected:
        case MessageActionEnum.RequestAllRejected: {
            return Object.assign({}, state, {
                lists: Object.assign(new Map(), state.lists,
                    {
                        [action.payload]:
                            Object.assign(new AbstractList(), state.lists[action.payload], {
                                requestStatus: RequestStatusEnum.error,
                            }),
                    }
                ),
            });
        }

        default:
            return state;
    }
}

export const MESSAGE_REDUCER: ActionReducer<MessageSlice> = messageReducer;
