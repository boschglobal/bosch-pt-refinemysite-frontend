/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Store} from '@ngrx/store';
import {TranslateModule} from '@ngx-translate/core';
import * as moment from 'moment';
import {of} from 'rxjs';
import {
    anything,
    instance,
    mock,
    when
} from 'ts-mockito';

import {updateWindowInnerWidth} from '../../../../../../../test/helpers';
import {MOCK_METRICS_ITEM_ALL_A} from '../../../../../../../test/mocks/metrics';
import {State} from '../../../../../../app.reducers';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {NameSeriesPair} from '../../../../../../shared/misc/parsers/name-series-pair.parser';
import {NameValuePair} from '../../../../../../shared/misc/parsers/name-value-pair.parser';
import {BreakpointsEnum} from '../../../../../../shared/ui/constants/breakpoints.constant';
import {DateParserStrategy} from '../../../../../../shared/ui/dates/date-parser.strategy';
import {FlyoutDirective} from '../../../../../../shared/ui/flyout/directive/flyout.directive';
import {FlyoutTooltipComponent} from '../../../../../../shared/ui/flyout-tooltip/flyout-tooltip.component';
import {ProjectNumberOfWeeksEnum} from '../../../../../project-common/enums/project-number-of-weeks.enum';
import {ProjectDateParserStrategy} from '../../../../../project-common/helpers/project-date-parser.strategy';
import {MetricsActions} from '../../../../../project-common/store/metrics/metrics.actions';
import {MetricsQueries} from '../../../../../project-common/store/metrics/metrics.queries';
import {ProjectMetricsTimeFilters} from '../../../../../project-common/store/metrics/slice/project-metrics-filters';
import {ProjectPpcAllComponent} from './project-ppc-all.component';

describe('PPC All component', () => {
    let comp: ProjectPpcAllComponent;
    let fixture: ComponentFixture<ProjectPpcAllComponent>;
    let store: Store<State>;
    let debugElement: DebugElement;

    const dateParserStrategyMock: ProjectDateParserStrategy = mock(ProjectDateParserStrategy);

    const referenceDate: moment.Moment = moment();
    const referenceDateWeek = referenceDate.week();
    const ppcAllTooltipInfoButtonSelector = '[data-automation="project-kpis-ppc-all-tooltip-info-button"]';
    const ppcAllTooltipInfoContentSelector = '[data-automation="project-ppc-all-tooltip-info"]';
    const getTimeFiltersByDuration = (duration: number): ProjectMetricsTimeFilters => ({
        duration,
        startDate: referenceDate.clone().startOf('week').subtract(duration, 'week').format('YYYY-MM-DD'),
    });
    const isSortValid = (list: NameValuePair[]) => list
        .reduce((validity, current, index) => {
            const previous = list[index - 1];

            if (!previous) {
                return validity;
            } else {
                const valueDifference = previous.value - current.value;

                return validity && (valueDifference === 0 ? current.name.localeCompare(previous.name) : valueDifference > 0);
            }
        }, true);

    const clickEvent: Event = new Event('click');
    const initialInnerWidth: number = window.innerWidth;
    const storeMock: Store<State> = mock(Store);
    const getPpcAllTooltipInfoButton = () => debugElement.query(By.css(ppcAllTooltipInfoButtonSelector)).nativeElement;
    const getPpcAllTooltipInfoContent = () => document.querySelectorAll(ppcAllTooltipInfoContentSelector);
    const metricsQueriesMock: MetricsQueries = mock(MetricsQueries);
    const METRICS_TIME_FILTERS_4_WEEKS: ProjectMetricsTimeFilters = getTimeFiltersByDuration(ProjectNumberOfWeeksEnum.month);
    const METRICS_TIME_FILTERS_12_WEEKS: ProjectMetricsTimeFilters = getTimeFiltersByDuration(ProjectNumberOfWeeksEnum.trimester);

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslateModule.forRoot(),
        ],
        declarations: [
            FlyoutDirective,
            FlyoutTooltipComponent,
            ProjectPpcAllComponent,
        ],
        providers: [
            {
                provide: DateParserStrategy,
                useValue: instance(dateParserStrategyMock),
            },
            {
                provide: MetricsQueries,
                useValue: instance(metricsQueriesMock),
            },
            {
                provide: Store,
                useValue: instance(storeMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectPpcAllComponent);
        comp = fixture.componentInstance;
        debugElement = fixture.debugElement;
        store = TestBed.inject(Store);

        when(dateParserStrategyMock.week(anything())).thenReturn(referenceDateWeek);
        when(metricsQueriesMock.observeTimeFilters()).thenReturn(of(METRICS_TIME_FILTERS_4_WEEKS));
        when(metricsQueriesMock.observeFulfilledDayCardsAll()).thenReturn(of([MOCK_METRICS_ITEM_ALL_A]));
        when(metricsQueriesMock.observeFulfilledDayCardsAllRequestStatus()).thenReturn(of(RequestStatusEnum.success));

        comp.ngOnInit();

        fixture.detectChanges();
    });

    afterEach(() => {
        updateWindowInnerWidth(initialInnerWidth);
    });

    it('should create the component', () => {
        expect(comp).toBeDefined();
    });

    it('should dispatch request for FulfilledDayCardsAll action when time filter changes', () => {
        const expectedResult = new MetricsActions.Request.FulfilledDayCardsAll();

        spyOn(store, 'dispatch').and.callThrough();

        when(metricsQueriesMock.observeTimeFilters()).thenReturn(of(METRICS_TIME_FILTERS_12_WEEKS));

        comp.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should set loading in progress when request status is in progress', () => {
        when(metricsQueriesMock.observeFulfilledDayCardsAllRequestStatus()).thenReturn(of(RequestStatusEnum.progress));

        comp.ngOnInit();

        expect(comp.isLoading).toBeTruthy();
    });

    it('should unset loading in progress when request status is successful', () => {
        when(metricsQueriesMock.observeFulfilledDayCardsAllRequestStatus()).thenReturn(of(RequestStatusEnum.success));

        comp.ngOnInit();

        expect(comp.isLoading).toBeFalsy();
    });

    it('should set fulfilledDayCardsAll with the correct data', () => {
        comp.ngOnInit();
        when(metricsQueriesMock.observeFulfilledDayCardsAll()).thenReturn(of([MOCK_METRICS_ITEM_ALL_A]));

        expect(comp.fulfilledDayCardsAll).toEqual(MOCK_METRICS_ITEM_ALL_A);
    });

    it('should set fulfilledDayCardsAllGraphData with the correct data for the graph chart', () => {
        const expectedResult: NameSeriesPair = {
            name: 'ProjectPpcAllGraph',
            series: MOCK_METRICS_ITEM_ALL_A.series.map(item => ({
                name: `${referenceDateWeek}`,
                value: item.metrics.ppc || null,
            })),
        };

        when(metricsQueriesMock.observeFulfilledDayCardsAll()).thenReturn(of([MOCK_METRICS_ITEM_ALL_A]));

        comp.ngOnInit();

        expect(comp.fulfilledDayCardsAllGraphData).toEqual(expectedResult);
    });

    it('should set fulfilledDayCardsAllGraphData with the correct data for the graph chart when resolution is less then MD', () => {
        const expectedResult: NameSeriesPair = {
            name: 'ProjectPpcAllGraph',
            series: MOCK_METRICS_ITEM_ALL_A.series.map(item => ({
                name: `${referenceDateWeek}`,
                value: item.metrics.ppc || null,
            })),
        };

        when(metricsQueriesMock.observeFulfilledDayCardsAll()).thenReturn(of([MOCK_METRICS_ITEM_ALL_A]));

        comp.ngOnInit();

        updateWindowInnerWidth(BreakpointsEnum.xs);

        expect(comp.fulfilledDayCardsAllGraphData).toEqual(expectedResult);
    });

    it('should set fulfilledDayCardsAllRfvListTotals with all the RFVs entries', () => {
        const expectedResult: number = MOCK_METRICS_ITEM_ALL_A.totals.rfv.length;

        when(metricsQueriesMock.observeFulfilledDayCardsAll()).thenReturn(of([MOCK_METRICS_ITEM_ALL_A]));

        comp.ngOnInit();

        expect(comp.fulfilledDayCardsAllRfvListTotals.length).toEqual(expectedResult);
    });

    it('should set fulfilledDayCardsAllRfvListTotals data in a descending order of their values and alphabetically ascending', () => {
        when(metricsQueriesMock.observeFulfilledDayCardsAll()).thenReturn(of([MOCK_METRICS_ITEM_ALL_A]));

        comp.ngOnInit();

        expect(isSortValid(comp.fulfilledDayCardsAllRfvListTotals)).toBeTruthy();
    });

    it('should set fulfilledDayCardsAllRfvListByWeek data in a descending order of their values and alphabetically ascending', () => {
        when(metricsQueriesMock.observeFulfilledDayCardsAll()).thenReturn(of([MOCK_METRICS_ITEM_ALL_A]));

        comp.ngOnInit();

        for (const week of comp.fulfilledDayCardsAllRfvListByWeek) {
            expect(isSortValid(week.value)).toBeTruthy();
        }
    });

    it('should format X axis tick label accordingly when resolution is higher then XS', () => {
        const value = '100';
        const expectedResult = `Generic_Week ${value}`;

        when(metricsQueriesMock.observeFulfilledDayCardsAll()).thenReturn(of([MOCK_METRICS_ITEM_ALL_A]));

        comp.ngOnInit();

        updateWindowInnerWidth(BreakpointsEnum.md);

        expect(comp.fulfilledDayCardsAllGraphSettings.xAxisTickFormatting(value)).toEqual(expectedResult);
    });

    it('should format X axis tick label accordingly when resolution is lower then MD', () => {
        const value = '100';
        const expectedResult = '100';

        when(metricsQueriesMock.observeFulfilledDayCardsAll()).thenReturn(of([MOCK_METRICS_ITEM_ALL_A]));

        comp.ngOnInit();

        updateWindowInnerWidth(BreakpointsEnum.xs);

        expect(comp.fulfilledDayCardsAllGraphSettings.xAxisTickFormatting(value)).toEqual(expectedResult);
    });

    it('should render the info tooltip when user clicks in the info button', (done) => {
        getPpcAllTooltipInfoButton().dispatchEvent(clickEvent);

        setTimeout(() => {
            expect(getPpcAllTooltipInfoContent()).toBeDefined();
            done();
        }, 1);
    });
});
