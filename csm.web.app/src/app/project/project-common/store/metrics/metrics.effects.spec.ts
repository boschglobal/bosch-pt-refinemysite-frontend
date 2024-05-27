/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Store} from '@ngrx/store';
import {
    Observable,
    of,
    ReplaySubject,
    throwError
} from 'rxjs';

import {
    MOCK_METRICS_ITEM_ALL_A,
    MOCK_METRICS_ITEM_GROUPED_A,
    MOCK_METRICS_LIST_ALL,
    MOCK_METRICS_LIST_GROUPED,
    MOCK_METRICS_RFV_ALL,
    MOCK_METRICS_RFV_ALL_A,
} from '../../../../../test/mocks/metrics';
import {MOCK_PROJECT_1} from '../../../../../test/mocks/projects';
import {MockStore} from '../../../../../test/mocks/store';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {MetricsService} from '../../api/metrics/metrics.service';
import {MetricsListResource} from '../../api/metrics/resources/metrics-list.resource';
import {MetricsActions} from './metrics.actions';
import {MetricsEffects} from './metrics.effects';

describe('Metrics Effects', () => {
    let metricsEffects: MetricsEffects;
    let metricsService: any;
    let actions: ReplaySubject<any>;

    const getFulfilledDayCardsAll: Observable<MetricsListResource> = of(MOCK_METRICS_LIST_ALL);
    const getFulfilledDayCardsGrouped: Observable<MetricsListResource> = of(MOCK_METRICS_LIST_GROUPED);
    const getReasonsForVarianceAll: Observable<MetricsListResource> = of(MOCK_METRICS_RFV_ALL);
    const errorResponse: Observable<any> = throwError('error');

    const moduleDef: TestModuleMetadata = {
        providers: [
            MetricsEffects,
            provideMockActions(() => actions),
            {
                provide: MetricsService,
                useValue: jasmine.createSpyObj('MetricsService', ['findAll'])
            },
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        projectModule: {
                            projectSlice: {
                                currentItem: {
                                    id: MOCK_PROJECT_1.id
                                }
                            },
                            metricsSlice: {
                                fulfilledDayCardsAll: {
                                    items: [MOCK_METRICS_ITEM_ALL_A],
                                    requestStatus: RequestStatusEnum.success,
                                },
                                fulfilledDayCardsGrouped: {
                                    items: [MOCK_METRICS_ITEM_GROUPED_A],
                                    requestStatus: RequestStatusEnum.success,
                                },
                                reasonsForVarianceAll: {
                                    items: [MOCK_METRICS_RFV_ALL_A],
                                    requestStatus: RequestStatusEnum.success,
                                },
                                timeFilters: {
                                    startDate: '',
                                    duration: 4,
                                }
                            }
                        }
                    }
                )
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        metricsEffects = TestBed.inject(MetricsEffects);
        metricsService = TestBed.inject(MetricsService);
        actions = new ReplaySubject(1);
    });

    it('should trigger a REQUEST_FULFILLED_DAY_CARDS_ALL_FULFILLED', () => {
        const expectedResult = new MetricsActions.Request.FulfilledDayCardsAllFulfilled(MOCK_METRICS_LIST_ALL);

        metricsService.findAll.and.returnValue(getFulfilledDayCardsAll);
        actions.next(new MetricsActions.Request.FulfilledDayCardsAll());
        metricsEffects.requestFulfilledDayCardsAll$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a REQUEST_FULFILLED_DAY_CARDS_ALL_REJECTED', () => {
        const expectedResult = new MetricsActions.Request.FulfilledDayCardsAllRejected();

        metricsService.findAll.and.returnValue(errorResponse);
        actions.next(new MetricsActions.Request.FulfilledDayCardsAll());
        metricsEffects.requestFulfilledDayCardsAll$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a REQUEST_FULFILLED_DAY_CARDS_GROUPED_FULFILLED', () => {
        const expectedResult = new MetricsActions.Request.FulfilledDayCardsGroupedFulfilled(MOCK_METRICS_LIST_GROUPED);

        metricsService.findAll.and.returnValue(getFulfilledDayCardsGrouped);
        actions.next(new MetricsActions.Request.FulfilledDayCardsGrouped());
        metricsEffects.requestFulfilledDayCardsGrouped$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a REQUEST_FULFILLED_DAY_CARDS_GROUPED_REJECTED', () => {
        const expectedResult = new MetricsActions.Request.FulfilledDayCardsGroupedRejected();

        metricsService.findAll.and.returnValue(errorResponse);
        actions.next(new MetricsActions.Request.FulfilledDayCardsGrouped());
        metricsEffects.requestFulfilledDayCardsGrouped$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a MetricsActions.Request.ReasonsForVarianceAllFulfilled', () => {
        const expectedResult = new MetricsActions.Request.ReasonsForVarianceAllFulfilled(MOCK_METRICS_RFV_ALL);

        metricsService.findAll.and.returnValue(getReasonsForVarianceAll);
        actions.next(new MetricsActions.Request.ReasonsForVarianceAll());
        metricsEffects.requestReasonsForVarianceAll$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a MetricsActions.Request.ReasonsForVarianceAllRejected', () => {
        const expectedResult = new MetricsActions.Request.ReasonsForVarianceAllRejected();

        metricsService.findAll.and.returnValue(errorResponse);
        actions.next(new MetricsActions.Request.ReasonsForVarianceAll());
        metricsEffects.requestReasonsForVarianceAll$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

});
