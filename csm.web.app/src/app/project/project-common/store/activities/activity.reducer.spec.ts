/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    cloneDeep,
    union
} from 'lodash';

import {
    MOCK_ACTIVITY_1,
    MOCK_ACTIVITY_2,
    MOCK_ACTIVITY_LIST
} from '../../../../../test/mocks/activities';
import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {
    ActivityActionEnum,
    ActivityActions
} from './activity.actions';
import {ACTIVITY_SLICE_INITIAL_STATE} from './activity.initial-state';
import {ACTIVITY_REDUCER} from './activity.reducer';
import {ActivitySlice} from './activity.slice';

describe('Activity Reducer', () => {
    let initialState: ActivitySlice;
    let nextState: ActivitySlice;

    beforeEach(() => {
        initialState = ACTIVITY_SLICE_INITIAL_STATE;
        nextState = cloneDeep(ACTIVITY_SLICE_INITIAL_STATE);
    });

    it('should handle INITIALIZE_ALL_TOPICS', () => {
        const action: ActivityActions = new ActivityActions.Initialize.All();

        expect(ACTIVITY_REDUCER(initialState, action)).toBe(initialState);
    });

    it('should handle REQUEST_ALL_TOPICS', () => {
        const action: ActivityActions = {
            type: ActivityActionEnum.REQUEST_ALL_ACTIVITIES,
            payload: {
                taskId: 'foo'
            }
        };

        nextState.list = Object.assign(new AbstractList(), nextState.list, {
            requestStatus: RequestStatusEnum.progress
        });

        expect(ACTIVITY_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle REQUEST_ALL_TOPICS_FULFILLED', () => {
        const action: ActivityActions = {
            type: ActivityActionEnum.REQUEST_ALL_ACTIVITIES_FULFILLED,
            payload: MOCK_ACTIVITY_LIST
        };

        nextState.list = Object.assign(new AbstractList(), nextState.list, {
            ids: union(nextState.list.ids, [MOCK_ACTIVITY_1.id, MOCK_ACTIVITY_2.id]),
            requestStatus: RequestStatusEnum.success,
            _links: action.payload._links
        });

        nextState.items = MOCK_ACTIVITY_LIST.activities;
        nextState.list._links = MOCK_ACTIVITY_LIST._links;
        expect(ACTIVITY_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle REQUEST_ALL_TOPICS_REJECTED', () => {
        const action: ActivityActions = {
            type: ActivityActionEnum.REQUEST_ALL_ACTIVITIES_REJECTED,
        };

        nextState.list = Object.assign(new AbstractList(), nextState.list, {
            requestStatus: RequestStatusEnum.error
        });

        expect(ACTIVITY_REDUCER(initialState, action)).toEqual(nextState);
    });
});
