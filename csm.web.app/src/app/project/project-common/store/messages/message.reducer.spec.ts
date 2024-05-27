/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {cloneDeep} from 'lodash';

import {
    MOCK_MESSAGE_1,
    MOCK_MESSAGE_2,
    MOCK_MESSAGE_LIST
} from '../../../../../test/mocks/messages';
import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {MessageResource} from '../../api/messages/resources/message.resource';
import {MessageActions} from './message.actions';
import {MESSAGE_SLICE_INITIAL_STATE} from './message.initial-state';
import {MESSAGE_REDUCER} from './message.reducer';
import {MessageSlice} from './message.slice';

describe('Message Reducer', () => {
    let initialState: MessageSlice;
    let midState: MessageSlice;
    let nextState: MessageSlice;

    const testDataTopicId = 'abc';

    beforeEach(() => {
        initialState = MESSAGE_SLICE_INITIAL_STATE;
        midState = cloneDeep(MESSAGE_SLICE_INITIAL_STATE);
        nextState = cloneDeep(MESSAGE_SLICE_INITIAL_STATE);
    });

    it('should handle INITIALIZE_ALL_MESSAGES', () => {
        const action = new MessageActions.Initialize.All();

        expect(MESSAGE_REDUCER(initialState, action)).toEqual(initialState);
    });

    it('should handle MessageActions.Create.One()', () => {
        const action = new MessageActions.Create.One({topicId: testDataTopicId});

        nextState.lists[testDataTopicId] = Object.assign(new AbstractList(), {requestStatus: RequestStatusEnum.progress});

        expect(MESSAGE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle MessageActions.Create.OneFulfilled()', () => {
        const action = new MessageActions.Create.OneFulfilled(MOCK_MESSAGE_1);

        nextState.items = [MOCK_MESSAGE_1];
        nextState.lists[MOCK_MESSAGE_1.topicId] = Object.assign(new AbstractList(), {
            ids: [MOCK_MESSAGE_1.id],
            requestStatus: RequestStatusEnum.success,
        });
        expect(MESSAGE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle MessageActions.Create.OneRejected()', () => {
        const action = new MessageActions.Create.OneRejected(testDataTopicId);

        nextState.lists = Object.assign(new Map(), nextState.lists, {
            [action.payload]:
                Object.assign(new AbstractList(), nextState.lists[action.payload], {
                    requestStatus: RequestStatusEnum.error,
                }),
        });
        expect(MESSAGE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle MessageActions.Request.All()', () => {
        const action = new MessageActions.Request.All({topicId: testDataTopicId});

        nextState.lists[testDataTopicId] = Object.assign(new AbstractList(), {requestStatus: RequestStatusEnum.progress});
        expect(MESSAGE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle MessageActions.Request.AllFulfilled()', () => {
        const action = new MessageActions.Request.AllFulfilled({
            topicId: testDataTopicId,
            messageList: MOCK_MESSAGE_LIST,
        });

        nextState.items = MOCK_MESSAGE_LIST.messages;
        nextState.lists[testDataTopicId] = Object.assign(new AbstractList(), {
            ids: MOCK_MESSAGE_LIST.messages.map((message: MessageResource) => message.id),
            requestStatus: RequestStatusEnum.success,
            _links: MOCK_MESSAGE_LIST._links,
        });
        expect(MESSAGE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle MessageActions.Request.AllFulfilled() when some messages are already stored', () => {
        const action = new MessageActions.Request.AllFulfilled({
            topicId: testDataTopicId,
            messageList: MOCK_MESSAGE_LIST,
        });
        const mutatedState: MessageSlice = MESSAGE_REDUCER(initialState, action);

        nextState.items = MOCK_MESSAGE_LIST.messages;
        nextState.lists[testDataTopicId] = Object.assign(new AbstractList(), {
            ids: MOCK_MESSAGE_LIST.messages.map((message: MessageResource) => message.id),
            requestStatus: RequestStatusEnum.success,
            _links: MOCK_MESSAGE_LIST._links,
        });
        expect(MESSAGE_REDUCER(mutatedState, action)).toEqual(nextState);
    });

    it('should handle MessageActions.Request.AllRejected()', () => {
        const action = new MessageActions.Request.AllRejected(testDataTopicId);

        nextState.lists[testDataTopicId] = Object.assign(new AbstractList(), {requestStatus: RequestStatusEnum.error});
        expect(MESSAGE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle MessageActions.Delete.One()', () => {
        const action = new MessageActions.Delete.One(
            {
                topicId: MOCK_MESSAGE_1.topicId,
                messageId: MOCK_MESSAGE_1.id,
            }
        );

        nextState.lists = Object.assign(new Map(), nextState.lists, {
            [MOCK_MESSAGE_1.topicId]:
                Object.assign(
                    new AbstractList(),
                    nextState.lists[MOCK_MESSAGE_1.topicId],
                    {requestStatus: RequestStatusEnum.progress}
                ),
        });
        expect(MESSAGE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle MessageActions.Delete.OneFulfilled()', () => {
        const action = new MessageActions.Delete.OneFulfilled({
            topicId: MOCK_MESSAGE_1.topicId,
            messageId: MOCK_MESSAGE_1.id,
        });

        // Arrange mid state to remove message afterwards
        midState.items = [MOCK_MESSAGE_1, MOCK_MESSAGE_2];
        midState.lists = Object.assign(new Map(), midState.lists, {
            [MOCK_MESSAGE_1.topicId]:
                Object.assign(
                    new AbstractList(),
                    midState.lists[MOCK_MESSAGE_1.topicId],
                    {
                        ids: [MOCK_MESSAGE_1.id, '2', '3', '4'],
                        requestStatus: RequestStatusEnum.progress,
                    }
                ),
        });

        // Arrange new state to assert
        nextState.items = [MOCK_MESSAGE_2];
        nextState.lists = Object.assign(new Map(), midState.lists, {
            [MOCK_MESSAGE_1.topicId]:
                Object.assign(
                    new AbstractList(),
                    midState.lists[MOCK_MESSAGE_1.topicId],
                    {
                        ids: ['2', '3', '4'], // verify not only item removal but also mapping with the topic in the lists
                        requestStatus: RequestStatusEnum.success,
                    }
                ),
        });
        expect(MESSAGE_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle MessageActions.Delete.OneRejected()', () => {
        const action = new MessageActions.Delete.OneRejected(testDataTopicId);

        nextState.lists = Object.assign(new Map(), nextState.lists, {
            [action.payload]:
                Object.assign(new AbstractList(), nextState.lists[action.payload], {
                    requestStatus: RequestStatusEnum.error,
                }),
        });
        expect(MESSAGE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle MessageActions.Delete.OneReset()', () => {
        const action = new MessageActions.Delete.OneReset(testDataTopicId);

        midState.lists = Object.assign(new Map(), midState.lists, {
            [action.payload]:
                Object.assign(
                    new AbstractList(),
                    midState.lists[action.payload],
                    {requestStatus: RequestStatusEnum.error}
                ),
        });

        nextState.lists = Object.assign(new Map(), nextState.lists, {
            [action.payload]:
                Object.assign(
                    new AbstractList(),
                    nextState.lists[action.payload],
                    {requestStatus: RequestStatusEnum.empty}
                ),
        });

        expect(MESSAGE_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle MessageActions.Initialize.AllByTopic()', () => {
        const action = new MessageActions.Initialize.AllByTopic(MOCK_MESSAGE_1.topicId);

        midState.items = [MOCK_MESSAGE_1, MOCK_MESSAGE_2];
        midState.lists = Object.assign(new Map(), midState.lists, {
            [action.payload]:
                Object.assign(
                    new AbstractList(),
                    midState.lists[action.payload],
                    {
                        ids: [MOCK_MESSAGE_1.id, MOCK_MESSAGE_2.id],
                        requestStatus: RequestStatusEnum.success,
                    }
                ),
        });

        nextState.items = [];
        nextState.lists = Object.assign(new Map(), nextState.lists, {
            [action.payload]: new AbstractList(),
        });

        expect(MESSAGE_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle unknown action', () => {
        const action = {type: 'UNKNOWN'};

        expect(MESSAGE_REDUCER(initialState, action)).toEqual(initialState);
    });
});
