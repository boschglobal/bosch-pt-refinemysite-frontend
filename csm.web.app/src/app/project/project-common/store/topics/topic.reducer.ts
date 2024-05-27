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
    unionBy
} from 'lodash';

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {TopicResource} from '../../api/topics/resources/topic.resource';
import {MessageActionEnum} from '../messages/message.actions';
import {
    TopicActionEnum,
    TopicActions
} from './topic.actions';
import {TOPIC_SLICE_INITIAL_STATE} from './topic.initial-state';
import {TopicSlice} from './topic.slice';

export function topicReducer(state: TopicSlice = TOPIC_SLICE_INITIAL_STATE, action: TopicActions): TopicSlice {
    switch (action.type) {

        case TopicActionEnum.InitializeAll:
            return TOPIC_SLICE_INITIAL_STATE;

        case TopicActionEnum.DeleteOne:
        case TopicActionEnum.RequestAll:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractList(), state.list, {
                    requestStatus: RequestStatusEnum.progress
                })
            });

        case TopicActionEnum.RequestAllFulfilled: {
            const requestAllTopicsFulfilledAction = action;
            const topics: TopicResource[] = requestAllTopicsFulfilledAction.payload.topics;
            const topicIds: string[] = topics.map((topic: TopicResource) => topic.id);

            return Object.assign({}, state, {
                items: unionBy(topics, state.items, 'id'),
                list: Object.assign(new AbstractList(), state.list, {
                    ids: union(state.list.ids, topicIds),
                    requestStatus: RequestStatusEnum.success,
                    _links: requestAllTopicsFulfilledAction.payload._links
                })
            });
        }

        case TopicActionEnum.DeleteOneRejected:
        case TopicActionEnum.RequestAllRejected:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractList(), state.list, {
                    requestStatus: RequestStatusEnum.error
                })
            });

        case TopicActionEnum.UpdateCriticalityFulfilled:
        case TopicActionEnum.RequestOneFulfilled:
            const requestOneFulfilled = action as TopicActions.Request.OneFulfilled;
            return Object.assign({}, state, {
                items: unionBy([requestOneFulfilled.payload], state.items, 'id')
            });

        case TopicActionEnum.UpdateList:
            const updateListAction = action;

            return Object.assign({}, state, {
                list: Object.assign(new AbstractList(), state.list, {
                    ids: union([updateListAction.payload], state.list.ids)
                })
            });

        case TopicActionEnum.CreateOne:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.progress
                })
            });

        case TopicActionEnum.CreateOneFulfilled:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success
                })
            });

        case TopicActionEnum.CreateOneRejected:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.error
                })
            });

        case TopicActionEnum.CreateOneReset:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.empty
                })
            });

        case TopicActionEnum.DeleteOneReset:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractList(), state.list, {
                    requestStatus: RequestStatusEnum.empty
                })
            });

        case TopicActionEnum.DeleteOneFulfilled: {
            const deleteOneFulfilledAction = action;

            return Object.assign({}, state, {
                items: state.items.filter(item => item.id !== deleteOneFulfilledAction.payload),
                list: Object.assign(new AbstractList(), state.list, {
                    requestStatus: RequestStatusEnum.success
                })
            });
        }

        case MessageActionEnum.CreateOneFulfilled: {
            const postMessageFulfilled = action;
            const messageTopic = state.items.find(item => item.id === postMessageFulfilled.payload.topicId);
            const updatedTopic = Object.assign({}, messageTopic, {messages: messageTopic.messages + 1});

            return Object.assign({}, state, {
                items: unionBy([updatedTopic], state.items, 'id')
            });
        }

        case MessageActionEnum.DeleteOneFulfilled: {
            const deleteMessageFulfilled = action;
            const messageTopic = state.items.find(item => item.id === deleteMessageFulfilled.payload.topicId);
            const updatedTopic = Object.assign({}, messageTopic, {messages: messageTopic.messages - 1});

            return Object.assign({}, state, {
                items: unionBy([updatedTopic], state.items, 'id')
            });
        }

        default:
            return state;
    }
}

export const TOPIC_REDUCER: ActionReducer<TopicSlice> = topicReducer;
