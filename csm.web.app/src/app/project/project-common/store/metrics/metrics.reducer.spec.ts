/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {cloneDeep} from 'lodash';
import * as moment from 'moment';

import {
    MOCK_METRICS_LIST_ALL,
    MOCK_METRICS_LIST_GROUPED
} from '../../../../../test/mocks/metrics';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItems} from '../../../../shared/misc/store/datatypes/abstract-items.datatype';
import {MetricsActions} from './metrics.actions';
import {METRICS_SLICE_INITIAL_STATE} from './metrics.initial-state';
import {METRICS_REDUCER} from './metrics.reducer';
import {MetricsSlice} from './metrics.slice';
import {ProjectMetricsTimeFilters} from './slice/project-metrics-filters';

describe('Metrics Reducer', () => {
    let initialState: MetricsSlice;
    let midState: MetricsSlice;
    let nextState: MetricsSlice;

    beforeEach(() => {
        initialState = METRICS_SLICE_INITIAL_STATE;
        midState = cloneDeep(METRICS_SLICE_INITIAL_STATE);
        nextState = cloneDeep(METRICS_SLICE_INITIAL_STATE);
    });

    it('should handle INITIALIZE_METRICS', () => {
        const action = new MetricsActions.Initialize.Metrics();
        expect(METRICS_REDUCER(initialState, action)).toEqual(initialState);
    });

    it('should handle REQUEST_FULFILLED_DAY_CARDS_ALL', () => {
        const action = new MetricsActions.Request.FulfilledDayCardsAll();

        nextState.fulfilledDayCardsAll = Object.assign(new AbstractItems(), nextState.fulfilledDayCardsAll, {
            requestStatus: RequestStatusEnum.progress
        });

        expect(METRICS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle REQUEST_FULFILLED_DAY_CARDS_ALL_FULFILLED', () => {
        const action = new MetricsActions.Request.FulfilledDayCardsAllFulfilled(MOCK_METRICS_LIST_ALL);

        midState.fulfilledDayCardsAll = Object.assign(new AbstractItems(), {
            items: MOCK_METRICS_LIST_ALL.items
        });

        nextState.fulfilledDayCardsAll = Object.assign(new AbstractItems(), {
            items: MOCK_METRICS_LIST_ALL.items,
            requestStatus: RequestStatusEnum.success
        });

        expect(METRICS_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle REQUEST_FULFILLED_DAY_CARDS_ALL_REJECTED', () => {
        const action = new MetricsActions.Request.FulfilledDayCardsAllRejected();

        nextState.fulfilledDayCardsAll = Object.assign(new AbstractItems(), {
            items: [],
            requestStatus: RequestStatusEnum.error
        });

        expect(METRICS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle REQUEST_FULFILLED_DAY_CARDS_GROUPED', () => {
        const action = new MetricsActions.Request.FulfilledDayCardsGrouped();

        nextState.fulfilledDayCardsGrouped = Object.assign(new AbstractItems(), {
            items: [],
            requestStatus: RequestStatusEnum.progress
        });

        expect(METRICS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle REQUEST_FULFILLED_DAY_CARDS_GROUPED_FULFILLED', () => {
        const action = new MetricsActions.Request.FulfilledDayCardsGroupedFulfilled(MOCK_METRICS_LIST_GROUPED);

        nextState.fulfilledDayCardsGrouped = Object.assign(new AbstractItems(), {
            items: MOCK_METRICS_LIST_GROUPED.items,
            requestStatus: RequestStatusEnum.success
        });

        expect(METRICS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle REQUEST_FULFILLED_DAY_CARDS_GROUPED_REJECTED', () => {
        const action = new MetricsActions.Request.FulfilledDayCardsGroupedRejected();

        nextState.fulfilledDayCardsGrouped = Object.assign(new AbstractItems(), {
            items: [],
            requestStatus: RequestStatusEnum.error
        });

        expect(METRICS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle REQUEST_REASONS_FOR_VARIANCE_ALL', () => {
        const action = new MetricsActions.Request.ReasonsForVarianceAll();

        nextState.reasonsForVarianceAll = Object.assign(new AbstractItems(), nextState.reasonsForVarianceAll, {
            requestStatus: RequestStatusEnum.progress
        });

        expect(METRICS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle REQUEST_REASONS_FOR_VARIANCE_ALL_FULFILLED', () => {
        const action = new MetricsActions.Request.ReasonsForVarianceAllFulfilled(MOCK_METRICS_LIST_ALL);

        nextState.reasonsForVarianceAll = Object.assign(new AbstractItems(), {
            items: MOCK_METRICS_LIST_ALL.items,
            requestStatus: RequestStatusEnum.success,
        });

        expect(METRICS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle REQUEST_REASONS_FOR_VARIANCE_ALL_REJECTED', () => {
        const action = new MetricsActions.Request.ReasonsForVarianceAllRejected();

        nextState.reasonsForVarianceAll = Object.assign(new AbstractItems(), nextState.reasonsForVarianceAll, {
            requestStatus: RequestStatusEnum.error
        });

        expect(METRICS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle SET_TIME_FILTERS', () => {
        const timeFilters = Object.assign({}, {startDate: moment().format('YYYY-MM-DD'), duration: 4});
        const action = new MetricsActions.Set.TimeFilters(timeFilters);

        nextState.timeFilters = Object.assign(new ProjectMetricsTimeFilters(), timeFilters);

        expect(METRICS_REDUCER(initialState, action)).toEqual(nextState);
    });

});
