/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ActionReducer} from '@ngrx/store';

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItems} from '../../../../shared/misc/store/datatypes/abstract-items.datatype';
import {
    MetricsActionEnum,
    MetricsActions
} from './metrics.actions';
import {METRICS_SLICE_INITIAL_STATE} from './metrics.initial-state';
import {MetricsSlice} from './metrics.slice';
import {ProjectMetricsTimeFilters} from './slice/project-metrics-filters';

export function metricsReducer(state: MetricsSlice = METRICS_SLICE_INITIAL_STATE, action: MetricsActions): MetricsSlice {
    switch (action.type) {

        case MetricsActionEnum.InitializeMetrics:
            return METRICS_SLICE_INITIAL_STATE;

        case MetricsActionEnum.RequestFulfilledDayCardsAll:
            return Object.assign({}, state, {
                fulfilledDayCardsAll: Object.assign(new AbstractItems(), state.fulfilledDayCardsAll, {
                    requestStatus: RequestStatusEnum.progress
                })
            });

        case MetricsActionEnum.RequestFulfilledDayCardsGrouped:
            return Object.assign({}, state, {
                fulfilledDayCardsGrouped: Object.assign(new AbstractItems(), state.fulfilledDayCardsGrouped, {
                    requestStatus: RequestStatusEnum.progress
                })
            });

        case MetricsActionEnum.RequestFulfilledDayCardsAllFulfilled:
            const requestAllFulfilledDayCards = action;

            return Object.assign({}, state, {
                fulfilledDayCardsAll: Object.assign(new AbstractItems(), {
                    items: requestAllFulfilledDayCards.payload.items,
                    requestStatus: RequestStatusEnum.success,
                })
            });

        case MetricsActionEnum.RequestFulfilledDayCardsGroupedFulfilled:
            const requestFulfilledDayCardsGrouped = action;

            return Object.assign({}, state, {
                fulfilledDayCardsGrouped: Object.assign(new AbstractItems(), {
                    items: requestFulfilledDayCardsGrouped.payload.items,
                    requestStatus: RequestStatusEnum.success,
                })
            });

        case MetricsActionEnum.RequestFulfilledDayCardsAllRejected:
            return Object.assign({}, state, {
                fulfilledDayCardsAll: Object.assign(new AbstractItems(), state.fulfilledDayCardsAll, {
                    requestStatus: RequestStatusEnum.error
                })
            });

        case MetricsActionEnum.RequestFulfilledDayCardsGroupedRejected:
            return Object.assign({}, state, {
                fulfilledDayCardsGrouped: Object.assign(new AbstractItems(), state.fulfilledDayCardsGrouped, {
                    requestStatus: RequestStatusEnum.error
                })
            });

        case MetricsActionEnum.RequestReasonsForVarianceAll:
            return Object.assign({}, state, {
                reasonsForVarianceAll: Object.assign(new AbstractItems(), state.reasonsForVarianceAll, {
                    requestStatus: RequestStatusEnum.progress
                })
            });

        case MetricsActionEnum.RequestReasonsForVarianceAllFulfilled:
            const requestReasonsForVarianceAllFulfilled = action;

            return Object.assign({}, state, {
                reasonsForVarianceAll: Object.assign(new AbstractItems(), {
                    items: requestReasonsForVarianceAllFulfilled.payload.items,
                    requestStatus: RequestStatusEnum.success,
                })
            });

        case MetricsActionEnum.RequestReasonsForVarianceAllRejected:
            return Object.assign({}, state, {
                reasonsForVarianceAll: Object.assign(new AbstractItems(), state.reasonsForVarianceAll, {
                    requestStatus: RequestStatusEnum.error
                })
            });

        case MetricsActionEnum.SetTimeFilters:
            const setTimeFilters = action;

            return Object.assign({}, state, {
                timeFilters: Object.assign(new ProjectMetricsTimeFilters(), setTimeFilters.payload)
            });

        default:
            return state;

    }
}

export const METRICS_REDUCER: ActionReducer<MetricsSlice> = metricsReducer;

