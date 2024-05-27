/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {MetricsListResource} from '../../api/metrics/resources/metrics-list.resource';
import {ProjectMetricsTimeFilters} from './slice/project-metrics-filters';

export enum MetricsActionEnum {
    InitializeMetrics = '[Metrics] Initialize metrics',
    RequestFulfilledDayCardsAll = '[Metrics] Request all fulfilled day cards',
    RequestFulfilledDayCardsAllFulfilled = '[Metrics] Request all fulfilled day cards fulfilled',
    RequestFulfilledDayCardsAllRejected = '[Metrics] Request all fulfilled day cards rejected',
    RequestFulfilledDayCardsGrouped = '[Metrics] Request grouped fulfilled day cards',
    RequestFulfilledDayCardsGroupedFulfilled = '[Metrics] Request grouped fulfilled day cards fulfilled ',
    RequestFulfilledDayCardsGroupedRejected = '[Metrics] Request grouped fulfilled day cards rejected',
    RequestReasonsForVarianceAll = '[Metrics] Request all Reasons For Variance',
    RequestReasonsForVarianceAllFulfilled = '[Metrics] Request all Reasons For Variance fulfilled',
    RequestReasonsForVarianceAllRejected = '[Metrics] Request all Reasons For Variance rejected',
    SetTimeFilters = '[Metrics] Set time filters',
}

export namespace MetricsActions {
    export namespace Initialize {

        export class Metrics implements Action {
            readonly type = MetricsActionEnum.InitializeMetrics;

            constructor() {
            }
        }
    }

    export namespace Request {
        export class FulfilledDayCardsAll implements Action {
            readonly type = MetricsActionEnum.RequestFulfilledDayCardsAll;

            constructor() {
            }
        }

        export class FulfilledDayCardsAllFulfilled implements Action {
            readonly type = MetricsActionEnum.RequestFulfilledDayCardsAllFulfilled;

            constructor(public payload: MetricsListResource) {
            }
        }

        export class FulfilledDayCardsAllRejected implements Action {
            readonly type = MetricsActionEnum.RequestFulfilledDayCardsAllRejected;

            constructor() {
            }
        }

        export class FulfilledDayCardsGrouped implements Action {
            readonly type = MetricsActionEnum.RequestFulfilledDayCardsGrouped;

            constructor() {
            }
        }

        export class FulfilledDayCardsGroupedFulfilled implements Action {
            readonly type = MetricsActionEnum.RequestFulfilledDayCardsGroupedFulfilled;

            constructor(public payload: MetricsListResource) {
            }
        }

        export class FulfilledDayCardsGroupedRejected implements Action {
            readonly type = MetricsActionEnum.RequestFulfilledDayCardsGroupedRejected;

            constructor() {
            }
        }

        export class ReasonsForVarianceAll implements Action {
            readonly type = MetricsActionEnum.RequestReasonsForVarianceAll;

            constructor() {
            }
        }

        export class ReasonsForVarianceAllFulfilled implements Action {
            readonly type = MetricsActionEnum.RequestReasonsForVarianceAllFulfilled;

            constructor(public payload: MetricsListResource) {
            }
        }

        export class ReasonsForVarianceAllRejected implements Action {
            readonly type = MetricsActionEnum.RequestReasonsForVarianceAllRejected;

            constructor() {
            }
        }
    }

    export namespace Set {
        export class TimeFilters implements Action {
            readonly type = MetricsActionEnum.SetTimeFilters;

            constructor(public payload: ProjectMetricsTimeFilters) {
            }
        }
    }
}

export type MetricsActions =
    MetricsActions.Initialize.Metrics |
    MetricsActions.Request.FulfilledDayCardsAll |
    MetricsActions.Request.FulfilledDayCardsAllFulfilled |
    MetricsActions.Request.FulfilledDayCardsAllRejected |
    MetricsActions.Request.FulfilledDayCardsGrouped |
    MetricsActions.Request.FulfilledDayCardsGroupedFulfilled |
    MetricsActions.Request.FulfilledDayCardsGroupedRejected |
    MetricsActions.Request.ReasonsForVarianceAll |
    MetricsActions.Request.ReasonsForVarianceAllFulfilled |
    MetricsActions.Request.ReasonsForVarianceAllRejected |
    MetricsActions.Set.TimeFilters;
