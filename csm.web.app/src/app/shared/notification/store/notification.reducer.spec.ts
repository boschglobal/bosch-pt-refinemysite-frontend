/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';
import {cloneDeep} from 'lodash';
import * as moment from 'moment';

import {
    NOTIFICATION_EMPTY_LIST_MOCK,
    NOTIFICATION_LIST_MOCK,
    NOTIFICATION_MOCK,
    NOTIFICATION_MOCK_2
} from '../../../../test/mocks/notifications';
import {AbstractMarkableList} from '../../misc/api/datatypes/abstract-markable-list.datatype';
import {RequestStatusEnum} from '../../misc/enums/request-status.enum';
import {NotificationResource} from '../api/resources/notification.resource';
import {NotificationActions} from './notification.actions';
import {NOTIFICATION_SLICE_INITIAL_STATE} from './notification.initial-state';
import {NOTIFICATION_REDUCER} from './notification.reducer';
import {NotificationSlice} from './notification.slice';

describe('Notification Reducer', () => {
    let initialState: NotificationSlice;
    let midState: NotificationSlice;
    let nextState: NotificationSlice;

    beforeEach(() => {
        initialState = NOTIFICATION_SLICE_INITIAL_STATE;
        midState = cloneDeep(NOTIFICATION_SLICE_INITIAL_STATE);
        nextState = cloneDeep(NOTIFICATION_SLICE_INITIAL_STATE);
    });

    it('should handle NotificationActions.Request.All()', () => {
        const action: Action = new NotificationActions.Request.All();

        nextState.list = Object.assign(new AbstractMarkableList(), nextState.list, {
            requestStatus: RequestStatusEnum.progress
        });

        expect(NOTIFICATION_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle NotificationActions.Request.AllFulfilled()', () => {
        const action: Action = new NotificationActions.Request.AllFulfilled(NOTIFICATION_LIST_MOCK);

        nextState.list = Object.assign(new AbstractMarkableList(), nextState.list, {
            ids: [NOTIFICATION_MOCK.id, NOTIFICATION_MOCK_2.id],
            requestStatus: RequestStatusEnum.success,
            _links: NOTIFICATION_LIST_MOCK._links,
            lastAdded: NOTIFICATION_MOCK.date,
            lastSeen: NOTIFICATION_LIST_MOCK.lastSeen
        });

        nextState.items = [NOTIFICATION_MOCK, NOTIFICATION_MOCK_2];
        expect(NOTIFICATION_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle NotificationActions.Request.AllFulfilled() with empty data', () => {
        const action: Action = new NotificationActions.Request.AllFulfilled(NOTIFICATION_EMPTY_LIST_MOCK);

        nextState.list = Object.assign(new AbstractMarkableList(), nextState.list, {
            ids: [],
            requestStatus: RequestStatusEnum.success,
            _links: NOTIFICATION_EMPTY_LIST_MOCK._links,
            lastAdded: null,
            lastSeen: NOTIFICATION_EMPTY_LIST_MOCK.lastSeen
        });

        expect(NOTIFICATION_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle NotificationActions.Request.AllRejected()', () => {
        const action: Action = new NotificationActions.Request.AllRejected();

        nextState.list = Object.assign(new AbstractMarkableList(), nextState.list, {
            requestStatus: RequestStatusEnum.error
        });

        expect(NOTIFICATION_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle NotificationActions.Request.AllBefore()', () => {
        const action: Action = new NotificationActions.Request.AllBefore(null);

        nextState.list = Object.assign(new AbstractMarkableList(), nextState.list, {
            requestStatus: RequestStatusEnum.progress
        });

        expect(NOTIFICATION_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle NotificationActions.Request.AllBeforeFulfilled()', () => {
        const action: Action = new NotificationActions.Request.AllBeforeFulfilled(NOTIFICATION_LIST_MOCK);

        nextState.list = Object.assign(new AbstractMarkableList(), nextState.list, {
            ids: [NOTIFICATION_MOCK.id, NOTIFICATION_MOCK_2.id],
            requestStatus: RequestStatusEnum.success,
            _links: NOTIFICATION_LIST_MOCK._links,
        });

        nextState.items = [NOTIFICATION_MOCK, NOTIFICATION_MOCK_2];
        expect(NOTIFICATION_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle NotificationActions.Request.AllBeforeFulfilled() with empty data', () => {
        const action: Action = new NotificationActions.Request.AllBeforeFulfilled(NOTIFICATION_EMPTY_LIST_MOCK);

        nextState.list = Object.assign(new AbstractMarkableList(), nextState.list, {
            ids: [],
            requestStatus: RequestStatusEnum.success,
            _links: NOTIFICATION_EMPTY_LIST_MOCK._links,
        });

        expect(NOTIFICATION_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle NotificationActions.Request.AllBeforeRejected()', () => {
        const action: Action = new NotificationActions.Request.AllBeforeRejected();

        nextState.list = Object.assign(new AbstractMarkableList(), nextState.list, {
            requestStatus: RequestStatusEnum.error
        });

        expect(NOTIFICATION_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle NotificationActions.Request.AllAfter()', () => {
        const action: Action = new NotificationActions.Request.AllAfter(null);

        nextState.list = Object.assign(new AbstractMarkableList(), nextState.list, {
            requestStatus: RequestStatusEnum.progress
        });

        expect(NOTIFICATION_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle NotificationActions.Request.AllAfterFulfilled()', () => {
        const action: Action = new NotificationActions.Request.AllAfterFulfilled(NOTIFICATION_LIST_MOCK);

        nextState.list = Object.assign(new AbstractMarkableList(), nextState.list, {
            ids: [NOTIFICATION_MOCK_2.id, NOTIFICATION_MOCK.id],
            requestStatus: RequestStatusEnum.success
        });

        nextState.items = [NOTIFICATION_MOCK_2, NOTIFICATION_MOCK];
        expect(NOTIFICATION_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle NotificationActions.Request.AllAfterFulfilled() with empty data', () => {
        const action: Action = new NotificationActions.Request.AllAfterFulfilled(NOTIFICATION_EMPTY_LIST_MOCK);

        nextState.list = Object.assign(new AbstractMarkableList(), nextState.list, {
            ids: [],
            requestStatus: RequestStatusEnum.success
        });

        expect(NOTIFICATION_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle NotificationActions.Request.AllAfterRejected()', () => {
        const action: Action = new NotificationActions.Request.AllAfterRejected();

        nextState.list = Object.assign(new AbstractMarkableList(), nextState.list, {
            requestStatus: RequestStatusEnum.error
        });

        expect(NOTIFICATION_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle NotificationActions.Set.AsReadFulfilled()', () => {
        const action: Action = new NotificationActions.Set.AsReadFulfilled(NOTIFICATION_MOCK.id);
        midState = NOTIFICATION_REDUCER(initialState, new NotificationActions.Request.AllFulfilled(NOTIFICATION_LIST_MOCK));

        const updatedItem = Object.assign(new NotificationResource(), NOTIFICATION_MOCK, {
            read: true
        });

        nextState = Object.assign({}, midState, {
            items: [updatedItem, NOTIFICATION_MOCK_2]
        });

        expect(NOTIFICATION_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle NotificationActions.Set.AsSeenFulfilled()', () => {
        const action: Action = new NotificationActions.Set.AsSeenFulfilled(NOTIFICATION_MOCK.date);

        nextState.list = Object.assign(new AbstractMarkableList(), initialState.list, {
            lastSeen: NOTIFICATION_MOCK.date
        });

        expect(NOTIFICATION_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle NotificationActions.Set.LastAdded() with no data', () => {
        const action: Action = new NotificationActions.Set.LastAdded(NOTIFICATION_MOCK.date);

        nextState.list = Object.assign(new AbstractMarkableList(), initialState.list, {
            lastAdded: NOTIFICATION_MOCK.date
        });

        expect(NOTIFICATION_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle NotificationActions.Set.LastAdded() with updated data', () => {
        const initialStateWithData = NOTIFICATION_REDUCER(initialState, new NotificationActions.Request.AllFulfilled(NOTIFICATION_LIST_MOCK));
        const newDate = moment(NOTIFICATION_MOCK.date).toISOString();
        const action: Action = new NotificationActions.Set.LastAdded(newDate);

        nextState = Object.assign({}, initialStateWithData, {
            list: Object.assign(new AbstractMarkableList(), initialStateWithData.list, {
                lastAdded: newDate
            })
        });

        expect(NOTIFICATION_REDUCER(initialStateWithData, action)).toEqual(nextState);
    });

    it('should handle NotificationActions.Set.LastAdded() with outdated data', () => {
        const initialStateWithData = NOTIFICATION_REDUCER(initialState, new NotificationActions.Request.AllFulfilled(NOTIFICATION_LIST_MOCK));
        const newDate = moment(NOTIFICATION_MOCK.date).add(1).toISOString();
        const action: Action = new NotificationActions.Set.LastAdded(newDate);

        nextState = Object.assign({}, initialStateWithData, {
            list: Object.assign(new AbstractMarkableList(), initialStateWithData.list, {
                lastAdded: newDate
            })
        });

        expect(NOTIFICATION_REDUCER(initialStateWithData, action)).toEqual(nextState);
    });

    it('should handle unknown action', () => {
        const action: Action = {type: 'UNKNOWN'};

        expect(NOTIFICATION_REDUCER(undefined, action)).toEqual(initialState);
    });

});
