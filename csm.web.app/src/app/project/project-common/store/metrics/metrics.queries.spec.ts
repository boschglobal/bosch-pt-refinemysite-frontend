/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    select,
    Store
} from '@ngrx/store';
import * as moment from 'moment';

import {
    MOCK_METRICS_ITEM_ALL_A,
    MOCK_METRICS_ITEM_GROUPED_A,
    MOCK_METRICS_RFV_ALL,
    MOCK_METRICS_RFV_ALL_A,
} from '../../../../../test/mocks/metrics';
import {MockStore} from '../../../../../test/mocks/store';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {MetricsResource} from '../../api/metrics/resources/metrics.resource';
import {MetricsQueries} from './metrics.queries';
import {ProjectMetricsTimeFilters} from './slice/project-metrics-filters';

describe('Metrics Queries', () => {
    let metricsQueries: MetricsQueries;
    let store: any;

    const MOCK_METRICS_ITEM_ALL_LIST = [MOCK_METRICS_ITEM_ALL_A];
    const MOCK_METRICS_ITEM_GROUP_LIST = [MOCK_METRICS_ITEM_GROUPED_A];
    const MOCK_TIME_FILTERS = {startDate: moment().format('YYYY-MM-DD'), duration: 4};

    const moduleDef: TestModuleMetadata = {

        providers: [
            MetricsQueries,
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        projectModule: {
                            metricsSlice: {
                                fulfilledDayCardsAll: {
                                    items: MOCK_METRICS_ITEM_ALL_LIST,
                                    requestStatus: RequestStatusEnum.success
                                },
                                fulfilledDayCardsGrouped: {
                                    items: MOCK_METRICS_ITEM_GROUP_LIST,
                                    requestStatus: RequestStatusEnum.success
                                },
                                reasonsForVarianceAll: {
                                    items: MOCK_METRICS_RFV_ALL.items,
                                    requestStatus: RequestStatusEnum.success
                                },
                                timeFilters: MOCK_TIME_FILTERS,
                            }
                        }
                    }
                )
            },
            HttpClient,
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        metricsQueries = TestBed.inject(MetricsQueries);
        store = TestBed.inject(Store);
    });

    it('should observe FULFILLED_DAY_CARDS_ALL', () => {
        metricsQueries
            .observeFulfilledDayCardsAll()
            .subscribe((result: MetricsResource[]) =>
                expect(result).toEqual([MOCK_METRICS_ITEM_ALL_A]));
    });

    it('should retrieve FULFILLED_DAY_CARDS_ALL', () => {
        const fulfilledDayCardsAll = metricsQueries.getFulFilledDayCardsAll() as any;

        store.pipe(
            select(fulfilledDayCardsAll))
            .subscribe((result) => expect(result).toEqual(MOCK_METRICS_ITEM_ALL_LIST));
    });

    it('should observe FULFILLED_DAY_CARDS_ALL_REQUEST_STATUS', () => {
        metricsQueries
            .observeFulfilledDayCardsAllRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toEqual(RequestStatusEnum.success));
    });

    it('should retrieve FULFILLED_DAY_CARDS_ALL_REQUEST_STATUS', () => {
        const fulfilledDayCardsAllStatus = metricsQueries.getFulfilledDayCardsAllRequestStatus() as any;

        store.pipe(
            select(fulfilledDayCardsAllStatus))
            .subscribe((result: RequestStatusEnum) => expect(result).toEqual(RequestStatusEnum.success));
    });

    it('should observe FULFILLED_DAY_CARDS_GROUPED', () => {
        metricsQueries
            .observeFulfilledDayCardsGrouped()
            .subscribe((result: MetricsResource[]) =>
                expect(result).toEqual([MOCK_METRICS_ITEM_GROUPED_A]));
    });

    it('should retrieve FULFILLED_DAY_CARDS_GROUPED', () => {
        const fulfilledDayCardsGrouped = metricsQueries.getFulFilledDayCardsGrouped() as any;

        store.pipe(
            select(fulfilledDayCardsGrouped))
            .subscribe((result) => expect(result).toEqual(MOCK_METRICS_ITEM_GROUP_LIST));
    });

    it('should observe FULFILLED_DAY_CARDS_GROUPED_REQUEST_STATUS', () => {
        metricsQueries
            .observeFulfilledDayCardsGroupedRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toEqual(RequestStatusEnum.success));
    });

    it('should retrieve FULFILLED_DAY_CARDS_GROUPED_REQUEST_STATUS', () => {
        const fulfilledDayCardsGroupedStatus = metricsQueries.getFulfilledDayCardsGroupedRequestStatus() as any;

        store.pipe(
            select(fulfilledDayCardsGroupedStatus))
            .subscribe((result: RequestStatusEnum) => expect(result).toEqual(RequestStatusEnum.success));
    });

    it('should observe REASONS_FOR_VARIANCE_ALL', () => {
        metricsQueries
            .observeReasonsForVarianceAll()
            .subscribe((result: MetricsResource) =>
                expect(result).toEqual(MOCK_METRICS_RFV_ALL_A));
    });

    it('should retrieve REASONS_FOR_VARIANCE_ALL', () => {
        const reasonsForVarianceAll = metricsQueries.getReasonsForVarianceAll() as any;

        store.pipe(
            select(reasonsForVarianceAll))
            .subscribe(result => expect(result).toEqual(MOCK_METRICS_RFV_ALL_A));
    });

    it('should observe REASONS_FOR_VARIANCE_ALL_REQUEST_STATUS', () => {
        metricsQueries
            .observeReasonsForVarianceAllRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toEqual(RequestStatusEnum.success));
    });

    it('should retrieve REASONS_FOR_VARIANCE_ALL_REQUEST_STATUS', () => {
        const reasonsForVarianceAllRequestStatus = metricsQueries.getReasonsForVarianceAllRequestStatus() as any;

        store.pipe(
            select(reasonsForVarianceAllRequestStatus))
            .subscribe(result => expect(result).toEqual(RequestStatusEnum.success));
    });

    it('should observe TIME_FILTERS', () => {
        metricsQueries
            .observeTimeFilters()
            .subscribe((result: ProjectMetricsTimeFilters) =>
                expect(result).toEqual(MOCK_TIME_FILTERS));
    });

    it('should retrieve TIME_FILTERS', () => {
        const timeFilters = metricsQueries.getTimeFilters() as any;

        store.pipe(
            select(timeFilters))
            .subscribe((result: ProjectMetricsTimeFilters) => expect(result).toEqual(MOCK_TIME_FILTERS));

    });
});
