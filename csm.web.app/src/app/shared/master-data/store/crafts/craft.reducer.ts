/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {AbstractLangIndexedList} from '../../../misc/api/datatypes/abstract-lang-indexed-list.datatype';
import {RequestStatusEnum} from '../../../misc/enums/request-status.enum';
import {
    CraftActions,
    REQUEST_CRAFTS,
    REQUEST_CRAFTS_FULFILLED,
    REQUEST_CRAFTS_REJECTED
} from './craft.actions';
import {CRAFT_SLICE_INITIAL_STATE} from './craft.initial-state';
import {CraftSlice} from './craft.slice';

export function craftReducer(state: CraftSlice = CRAFT_SLICE_INITIAL_STATE, action: Action): CraftSlice {
    switch (action.type) {
        case REQUEST_CRAFTS:
            return Object.assign({}, state, {
                requestStatus: RequestStatusEnum.progress,
            });

        case REQUEST_CRAFTS_FULFILLED:
            const requestCraftsFulfilledAction = action as CraftActions.Request.CraftsFulfilled;
            return Object.assign({}, state, {
                used: true,
                list: Object.assign(new AbstractLangIndexedList(), state.list, {
                        [requestCraftsFulfilledAction.payload.currentLang]: requestCraftsFulfilledAction.payload.crafts
                    }
                ),
                requestStatus: RequestStatusEnum.success,
            });

        case REQUEST_CRAFTS_REJECTED:
            return Object.assign({}, state, {
                requestStatus: RequestStatusEnum.error,
            });

        default:
            return state;
    }
}

export const CRAFT_REDUCER = craftReducer;
