/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {ActionReducer} from '@ngrx/store';

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {
    WorkDaysActionEnum,
    WorkDaysActions
} from './work-days.actions';
import {WORK_DAYS_INITIAL_STATE} from './work-days.initial-state';
import {WorkDaysSlice} from './work-days.slice';

function workDaysReducer(state: WorkDaysSlice = WORK_DAYS_INITIAL_STATE, action: WorkDaysActions): WorkDaysSlice {
    switch (action.type) {
        case WorkDaysActionEnum.InitializeAll: {
            return WORK_DAYS_INITIAL_STATE;
        }

        case WorkDaysActionEnum.RequestOne:
        case WorkDaysActionEnum.UpdateOne: {
            return Object.assign({}, state, {
                requestStatus: RequestStatusEnum.progress,
            });
        }

        case WorkDaysActionEnum.RequestOneFulfilled:
        case WorkDaysActionEnum.UpdateOneFulfilled: {
            const workdays = action.payload;

            return Object.assign({}, state, {
                item: workdays,
                requestStatus: RequestStatusEnum.success,
            });
        }

        case WorkDaysActionEnum.RequestOneRejected:
        case WorkDaysActionEnum.UpdateOneRejected: {
            return Object.assign({}, state, {
                requestStatus: RequestStatusEnum.error,
            });
        }

        default:
            return state;
    }
}

export const WORK_DAYS_REDUCER: ActionReducer<WorkDaysSlice> = workDaysReducer;
