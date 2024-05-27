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
import {FeatureResource} from '../api/resources/feature.resource';
import {
    FeatureActions,
    FeatureActionsEnum,
} from './feature.actions';
import {
    FEATURE_SLICE_INITIAL_STATE,
    FeatureSlice
} from './feature.slice';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';

export function featureReducer(state: FeatureSlice = FEATURE_SLICE_INITIAL_STATE, action: FeatureActions): FeatureSlice {
    switch (action.type) {
        case FeatureActionsEnum.InitializeAll:
            return FEATURE_SLICE_INITIAL_STATE;

        case FeatureActionsEnum.CreateFeature:
        case FeatureActionsEnum.SetFeatureDisable:
        case FeatureActionsEnum.SetFeatureEnable:
        case FeatureActionsEnum.SetFeatureWhitelistActive:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Progress
                })
            });

        case FeatureActionsEnum.CreateFeatureReset:
        case FeatureActionsEnum.SetFeatureReset:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Empty
                })
            });

        case FeatureActionsEnum.RequestFeatures:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractItem(), state.list, {
                    requestStatus: RequestStatusEnum.Progress
                })
            });

        case FeatureActionsEnum.CreateFeatureRejected:
        case FeatureActionsEnum.SetFeatureDisableRejected:
        case FeatureActionsEnum.SetFeatureEnableRejected:
        case FeatureActionsEnum.SetFeatureWhitelistActiveRejected:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Error
                })
            });

        case FeatureActionsEnum.RequestFeaturesRejected:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractItem(), state.list, {
                    requestStatus: RequestStatusEnum.Error
                })
            });

        case FeatureActionsEnum.RequestFeaturesFulfilled: {
            const ids = action.payload.items.map((feature: FeatureResource) => feature.id);

            return Object.assign({}, state, {
                items: unionBy([], action.payload.items, 'id'),
                list: Object.assign(new AbstractItem(), state.list, {
                    ids: union([], ids),
                    requestStatus: RequestStatusEnum.Success
                })
            });
        }

        case FeatureActionsEnum.CreateFeatureFulfilled:
        case FeatureActionsEnum.SetFeatureDisableFulfilled:
        case FeatureActionsEnum.SetFeatureEnableFulfilled:
        case FeatureActionsEnum.SetFeatureWhitelistActiveFulfilled:
            return Object.assign({}, state, {
                items: unionBy([action.feature], state.items, 'id'),
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Success
                })
            });

        default:
            return state;
    }
}

export const FEATURE_REDUCER = featureReducer;
