/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */
import {ActionReducer} from '@ngrx/store';

import {
    RealtimeActionEnum,
    RealtimeActions
} from './realtime.actions';
import {REALTIME_SLICE_INITIAL_STATE} from './realtime.initial-state';
import {RealtimeSlice} from './realtime.slice';

export function realtimeReducer(state: RealtimeSlice = REALTIME_SLICE_INITIAL_STATE, action: RealtimeActions): RealtimeSlice {
    switch (action.type) {

        case RealtimeActionEnum.SetContext:
            return Object.assign({}, state, {
                context: action.payload,
            });

        case RealtimeActionEnum.UnsetContext:
            return Object.assign({}, state, {
                context: null,
            });

        default:
            return state;
    }
}

export const REALTIME_REDUCER: ActionReducer<RealtimeSlice> = realtimeReducer;
