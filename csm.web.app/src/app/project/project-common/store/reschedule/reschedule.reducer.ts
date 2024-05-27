/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */
import {ActionReducer} from '@ngrx/store';

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {
    RescheduleActionEnum,
    RescheduleActions
} from './reschedule.actions';
import {RESCHEDULE_SLICE_INITIAL_STATE} from './reschedule.initial-state';
import {RescheduleSlice} from './reschedule.slice';

export function rescheduleReducer(state = RESCHEDULE_SLICE_INITIAL_STATE, action: RescheduleActions): RescheduleSlice {
    switch (action.type) {
        case RescheduleActionEnum.InitializeAll:
            return RESCHEDULE_SLICE_INITIAL_STATE;
        case RescheduleActionEnum.RescheduleOne: {
            return {
                ...state,
                requestStatus: RequestStatusEnum.progress,
            };
        }
        case RescheduleActionEnum.ValidateOne: {
            return {
                item: null,
                requestStatus: RequestStatusEnum.progress,
            };
        }
        case RescheduleActionEnum.ValidateOneFulfilled: {
            return {
                requestStatus: RequestStatusEnum.success,
                item: action.item,
            };
        }
        case RescheduleActionEnum.ValidateOneRejected:
        case RescheduleActionEnum.RescheduleOneRejected: {
            return {
                ...state,
                requestStatus: RequestStatusEnum.error,
            };
        }
        case RescheduleActionEnum.RescheduleOneFulfilled: {
            return {
                ...state,
                requestStatus: RequestStatusEnum.success,
            };
        }
        default:
            return state;
    }
}

export const RESCHEDULE_REDUCER: ActionReducer<RescheduleSlice> = rescheduleReducer;
