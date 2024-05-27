/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';
import {cloneDeep} from 'lodash';

import {MOCK_MESSAGE_1} from '../../../../../test/mocks/messages';
import {
    MOCK_TOPIC_1,
    MOCK_TOPIC_2,
    MOCK_TOPIC_LIST
} from '../../../../../test/mocks/task-topics';
import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {MessageResource} from '../../api/messages/resources/message.resource';
import {MessageActions} from '../messages/message.actions';
import {TopicActions} from './topic.actions';
import {TOPIC_SLICE_INITIAL_STATE} from './topic.initial-state';
import {TOPIC_REDUCER} from './topic.reducer';
import {TopicSlice} from './topic.slice';

describe('Topic Reducer', () => {
    let initialState: TopicSlice;
    let midState: TopicSlice;
    let nextState: TopicSlice;

    beforeEach(() => {
        initialState = TOPIC_SLICE_INITIAL_STATE;
        midState = cloneDeep(TOPIC_SLICE_INITIAL_STATE);
        nextState = cloneDeep(TOPIC_SLICE_INITIAL_STATE);
    });

    it('should handle TopicActions.Initialize.All()', () => {
        const action = new TopicActions.Initialize.All();

        expect(TOPIC_REDUCER(initialState, action)).toBe(initialState);
    });

    it('should handle TopicActions.Request.All()', () => {
        const action: Action = new TopicActions.Request.All();

        nextState.list = Object.assign(new AbstractList(), nextState.list, {
            requestStatus: RequestStatusEnum.progress
        });

        expect(TOPIC_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle TopicActions.Request.AllFulfilled()', () => {
        const action: Action = new TopicActions.Request.AllFulfilled(MOCK_TOPIC_LIST);

        nextState.list = Object.assign(new AbstractList(), nextState.list, {
            ids: [MOCK_TOPIC_1.id, MOCK_TOPIC_2.id],
            requestStatus: RequestStatusEnum.success,
            _links: MOCK_TOPIC_LIST._links
        });

        nextState.items = [MOCK_TOPIC_1, MOCK_TOPIC_2];
        expect(TOPIC_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle TopicActions.Request.AllRejected()', () => {
        const action: Action = new TopicActions.Request.AllRejected();

        nextState.list = Object.assign(new AbstractList(), nextState.list, {
            requestStatus: RequestStatusEnum.error
        });

        expect(TOPIC_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle TopicActions.Request.OneFulfilled()', () => {
        const action: Action = new TopicActions.Request.OneFulfilled(MOCK_TOPIC_1);

        nextState.items = [MOCK_TOPIC_1];
        expect(TOPIC_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle TopicActions.Update.CriticalityFulfilled()', () => {
        const action: Action = new TopicActions.Update.CriticalityFulfilled(MOCK_TOPIC_1);

        nextState.items = [MOCK_TOPIC_1];
        expect(TOPIC_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle TopicActions.Create.One()', () => {
        const action: Action = new TopicActions.Create.One(null);

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress
        });
        expect(TOPIC_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle TopicActions.Create.OneFulfilled()', () => {
        const action: Action = new TopicActions.Create.OneFulfilled(null);

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success
        });
        expect(TOPIC_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle TopicActions.Create.OneRejected()', () => {
        const action: Action = new TopicActions.Create.OneRejected();

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error
        });
        expect(TOPIC_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle TopicActions.Create.OneReset()', () => {
        const action: Action = new TopicActions.Create.OneReset();

        midState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error
        });

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty
        });

        expect(TOPIC_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle MessageActions.Create.MessageFulfilled()', () => {
        const message: MessageResource = Object.assign({}, MOCK_MESSAGE_1, {topicId: MOCK_TOPIC_1.id});
        const action: Action = new MessageActions.Create.OneFulfilled(message);

        midState.items = [MOCK_TOPIC_1];

        nextState.items = [Object.assign({}, MOCK_TOPIC_1, {
            messages: 1
        })];

        expect(TOPIC_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle MessageActions.Delete.OneFulfilled()', () => {
        const message: MessageResource = Object.assign({}, MOCK_MESSAGE_1, {topicId: MOCK_TOPIC_1.id});
        const action: Action = new MessageActions.Delete.OneFulfilled({
            topicId: message.topicId,
            messageId: message.id
        });

        midState.items = [Object.assign({}, MOCK_TOPIC_1, {
            messages: 7
        })];

        nextState.items = [Object.assign({}, MOCK_TOPIC_1, {
            messages: 6
        })];

        expect(TOPIC_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle TopicActions.Update.List()', () => {
        const payload = '123';
        const action: Action = new TopicActions.Update.List(payload);

        nextState.list = Object.assign(new AbstractList(), nextState.list, {
            ids: [payload]
        });

        expect(TOPIC_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle TopicActions.Delete.One()', () => {
        const action: Action = new TopicActions.Delete.One(MOCK_TOPIC_1.id);

        nextState.list = Object.assign(new AbstractList(), nextState.list, {
            requestStatus: RequestStatusEnum.progress
        });
        expect(TOPIC_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle TopicActions.Delete.OneFulfilled()', () => {
        const action: Action = new TopicActions.Delete.OneFulfilled(MOCK_TOPIC_1.id);

        midState.items = [MOCK_TOPIC_1, MOCK_TOPIC_2];
        midState.list = Object.assign(new AbstractList(), nextState.list, {
            requestStatus: RequestStatusEnum.progress
        });

        nextState.items = [MOCK_TOPIC_2];
        nextState.list = Object.assign(new AbstractList(), nextState.list, {
            requestStatus: RequestStatusEnum.success
        });
        expect(TOPIC_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle TopicActions.Delete.OneRejected()', () => {
        const action: Action = new TopicActions.Delete.OneRejected();

        nextState.list = Object.assign(new AbstractList(), nextState.list, {
            requestStatus: RequestStatusEnum.error
        });
        expect(TOPIC_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle TopicActions.Delete.OneReset()', () => {
        const action: Action = new TopicActions.Delete.OneReset();

        midState.list = Object.assign(new AbstractList(), nextState.list, {
            requestStatus: RequestStatusEnum.error
        });

        nextState.list = Object.assign(new AbstractList(), nextState.list, {
            requestStatus: RequestStatusEnum.empty
        });

        expect(TOPIC_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle unknown action', () => {
        const action: Action = {type: 'UNKNOWN'};

        expect(TOPIC_REDUCER(initialState, action)).toEqual(initialState);
    });
});
