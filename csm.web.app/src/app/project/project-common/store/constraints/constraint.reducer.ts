/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {ActionReducer} from '@ngrx/store';
import {unionBy} from 'lodash';

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {
    ConstraintActionEnum,
    ConstraintActions
} from './constraint.actions';
import {CONSTRAINT_INITIAL_STATE} from './constraint.initial-state';
import {ConstraintSlice} from './constraint.slice';

export function constraintReducer(state: ConstraintSlice = CONSTRAINT_INITIAL_STATE, action: ConstraintActions): ConstraintSlice {
    switch (action.type) {
        case ConstraintActionEnum.InitializeAll: {
            return CONSTRAINT_INITIAL_STATE;
        }

        case ConstraintActionEnum.RequestAll: {
            return Object.assign({}, state, {
                list: Object.assign(new AbstractList(), state.list, {
                    requestStatus: RequestStatusEnum.progress,
                }),
            });
        }

        case ConstraintActionEnum.RequestAllFulfilled: {
            return Object.assign({}, state, {
                items: unionBy(action.items, state.items, 'id'),
                list: Object.assign(new AbstractList(), state.list, {
                    ids: action.items.map(item => item.id),
                    requestStatus: RequestStatusEnum.success,
                }),
            });
        }

        case ConstraintActionEnum.RequestAllRejected: {
            return Object.assign({}, state, {
                list: Object.assign(new AbstractList(), state.list, {
                    requestStatus: RequestStatusEnum.error,
                }),
            });
        }

        case ConstraintActionEnum.UpdateOne:
        case ConstraintActionEnum.ActivateOne:
        case ConstraintActionEnum.DeactivateOne: {
            const constraint = state.items.find(item => item.id === action.item.key);
            const updatedConstraint = Object.assign({}, constraint, {requestStatus: RequestStatusEnum.progress});

            return Object.assign({}, state, {
                items: unionBy([updatedConstraint], state.items, 'id'),
            });
        }

        case ConstraintActionEnum.UpdateOneFulfilled:
        case ConstraintActionEnum.ActivateOneFulfilled:
        case ConstraintActionEnum.DeactivateOneFulfilled: {
            const constraint = Object.assign({}, action.item, {requestStatus: RequestStatusEnum.success});

            return Object.assign({}, state, {
                items: unionBy([constraint], state.items, 'id'),
            });
        }

        case ConstraintActionEnum.UpdateOneRejected:
        case ConstraintActionEnum.ActivateOneRejected:
        case ConstraintActionEnum.DeactivateOneRejected: {
            const constraint = state.items.find(item => item.id === action.itemId);
            const updatedConstraint = Object.assign({}, constraint, {requestStatus: RequestStatusEnum.error});

            return Object.assign({}, state, {
                items: unionBy([updatedConstraint], state.items, 'id'),
            });
        }

        default:
            return state;
    }
}

export const CONSTRAINT_REDUCER: ActionReducer<ConstraintSlice> = constraintReducer;
