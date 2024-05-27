/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    MetricsActionEnum,
    MetricsActions
} from './metrics.actions';

describe('Metrics Actions', () => {

    it('should check MetricsActions.Initialize.Metrics() type', () => {
        expect(new MetricsActions.Initialize.Metrics().type)
            .toBe(MetricsActionEnum.InitializeMetrics);
    });

    it('should check MetricsActions.Request.FulfilledDayCardsAll() type', () => {
        expect(new MetricsActions.Request.FulfilledDayCardsAll().type)
            .toBe(MetricsActionEnum.RequestFulfilledDayCardsAll);
    });

    it('should check MetricsActions.Request.FulfilledDayCardsAllFulfilled() type', () => {
        expect(new MetricsActions.Request.FulfilledDayCardsAllFulfilled(null).type)
            .toBe(MetricsActionEnum.RequestFulfilledDayCardsAllFulfilled);
    });

    it('should check MetricsActions.Request.FulfilledDayCardsAllRejected() type', () => {
        expect(new MetricsActions.Request.FulfilledDayCardsAllRejected().type)
            .toBe(MetricsActionEnum.RequestFulfilledDayCardsAllRejected);
    });

    it('should check MetricsActions.Request.FulfilledDayCardsGrouped() type', () => {
        expect(new MetricsActions.Request.FulfilledDayCardsGrouped().type)
            .toBe(MetricsActionEnum.RequestFulfilledDayCardsGrouped);
    });

    it('should check MetricsActions.Request.FulfilledDayCardsGroupedFulfilled() type', () => {
        expect(new MetricsActions.Request.FulfilledDayCardsGroupedFulfilled(null).type)
            .toBe(MetricsActionEnum.RequestFulfilledDayCardsGroupedFulfilled);
    });

    it('should check MetricsActions.Request.FulfilledDayCardsGroupedRejected() type', () => {
        expect(new MetricsActions.Request.FulfilledDayCardsGroupedRejected().type)
            .toBe(MetricsActionEnum.RequestFulfilledDayCardsGroupedRejected);
    });

    it('should check MetricsActions.Request.ReasonsForVarianceAll() type', () => {
        expect(new MetricsActions.Request.ReasonsForVarianceAll().type)
            .toBe(MetricsActionEnum.RequestReasonsForVarianceAll);
    });

    it('should check MetricsActions.Request.ReasonsForVarianceAllFulfilled() type', () => {
        expect(new MetricsActions.Request.ReasonsForVarianceAllFulfilled(null).type)
            .toBe(MetricsActionEnum.RequestReasonsForVarianceAllFulfilled);
    });

    it('should check MetricsActions.Request.ReasonsForVarianceAllRejected() type', () => {
        expect(new MetricsActions.Request.ReasonsForVarianceAllRejected().type)
            .toBe(MetricsActionEnum.RequestReasonsForVarianceAllRejected);
    });

    it('should check MetricsActions.Set.TimeFilters() type', () => {
        expect(new MetricsActions.Set.TimeFilters(null).type)
            .toBe(MetricsActionEnum.SetTimeFilters);
    });

});
