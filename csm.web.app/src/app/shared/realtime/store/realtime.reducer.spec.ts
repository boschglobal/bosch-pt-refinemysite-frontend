/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */
import {Action} from '@ngrx/store';
import {cloneDeep} from 'lodash';

import {ObjectIdentifierPair} from '../../misc/api/datatypes/object-identifier-pair.datatype';
import {RealtimeActions} from './realtime.actions';
import {REALTIME_SLICE_INITIAL_STATE} from './realtime.initial-state';
import {REALTIME_REDUCER} from './realtime.reducer';
import {RealtimeSlice} from './realtime.slice';

describe('Realtime Reducer', () => {
    let initialState: RealtimeSlice;
    let midState: RealtimeSlice;
    let nextState: RealtimeSlice;

    beforeEach(() => {
        initialState = REALTIME_SLICE_INITIAL_STATE;
        midState = cloneDeep(REALTIME_SLICE_INITIAL_STATE);
        nextState = cloneDeep(REALTIME_SLICE_INITIAL_STATE);
    });

    it('should handle SetContext', () => {
        const payload = new ObjectIdentifierPair(null, null);
        const action = new RealtimeActions.Set.Context(payload);

        nextState.context = payload;

        expect(REALTIME_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle UnsetContext', () => {
        const action = new RealtimeActions.Unset.Context();

        midState.context = new ObjectIdentifierPair(null, null);

        nextState.context = null;

        expect(REALTIME_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle initial state', () => {
        const defaultAction: Action = {type: 'DEFAULT'};
        expect(REALTIME_REDUCER(initialState, defaultAction)).toEqual(initialState);
    });
});
