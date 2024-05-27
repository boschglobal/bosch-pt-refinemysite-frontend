/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    AlertActionEnum,
    AlertActions
} from './alert.actions';
import {ALERT_SLICE_INITIAL_STATE} from './alert.initial-state';
import {AlertSlice} from './alert.slice';

export function alertReducer(state = ALERT_SLICE_INITIAL_STATE, action: AlertActions): AlertSlice {
    switch (action.type) {
        case AlertActionEnum.AddAlert:
            return Object.assign({}, state,
                {alerts: [...state.alerts, action.payload]});

        case AlertActionEnum.RemoveAlert:
            return Object.assign({}, state,
                {alerts: state.alerts.filter(alert => alert.id !== action.payload)});

        case AlertActionEnum.RemoveAllAlerts:
            return Object.assign({}, state, {alerts: []});

        default:
            return state;
    }
}

export const ALERT_REDUCER = alertReducer;
