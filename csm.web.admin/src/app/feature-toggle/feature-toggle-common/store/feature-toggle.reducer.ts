/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    union,
    unionBy
} from 'lodash';

import {AbstractItem} from '../../../shared/misc/store/datatypes/abstract-item.datatype';
import {FeatureToggleResource} from '../api/resources/feature-toggle.resource';
import {
    FeatureToggleActions,
    FeatureToggleActionsEnum,
} from './feature-toggle.actions';
import {
    FEATURE_TOGGLE_SLICE_INITIAL_STATE,
    FeatureToggleSlice
} from './feature-toggle.slice';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';

export function featureToggleReducer(
    state: FeatureToggleSlice = FEATURE_TOGGLE_SLICE_INITIAL_STATE,
    action: FeatureToggleActions): FeatureToggleSlice {

    switch (action.type) {
        case FeatureToggleActionsEnum.InitializeAll:
            return FEATURE_TOGGLE_SLICE_INITIAL_STATE;

        case FeatureToggleActionsEnum.DeleteFeatureToggleBySubjectId:
        case FeatureToggleActionsEnum.SetFeatureToggleBySubjectId:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Progress
                })
            });

        case FeatureToggleActionsEnum.RequestFeatureTogglesBySubjectId:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractItem(), state.list, {
                    requestStatus: RequestStatusEnum.Progress
                })
            });

        case FeatureToggleActionsEnum.DeleteFeatureToggleBySubjectIdRejected:
        case FeatureToggleActionsEnum.SetFeatureToggleBySubjectIdRejected:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Error
                })
            });

        case FeatureToggleActionsEnum.RequestFeatureTogglesBySubjectIdRejected:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractItem(), state.list, {
                    requestStatus: RequestStatusEnum.Error
                })
            });

        case FeatureToggleActionsEnum.SetFeatureToggleBySubjectIdFulfilled:
        case FeatureToggleActionsEnum.DeleteFeatureToggleBySubjectIdFulfilled:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Success
                })
            });

        case FeatureToggleActionsEnum.RequestFeatureTogglesBySubjectIdFulfilled: {
            const ids = action.payload.items.map((feature: FeatureToggleResource) => feature.featureId);
            return Object.assign({}, state, {
                items: unionBy([], action.payload.items, 'featureId'),
                list: Object.assign(new AbstractItem(), state.list, {
                    ids: union([], ids),
                    requestStatus: RequestStatusEnum.Success
                })
            });
        }

        default:
            return state;
    }
}

export const FEATURE_TOGGLE_REDUCER = featureToggleReducer;
