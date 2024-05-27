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
import {
    TranslateModule,
    TranslateService
} from '@ngx-translate/core';
import * as moment from 'moment';
import {of} from 'rxjs';
import {
    anything,
    instance,
    mock,
    when
} from 'ts-mockito';

import {updateWindowInnerWidth} from '../../../../../../../test/helpers';
import {
    MOCK_METRICS_ITEM_GROUPED_A,
    MOCK_METRICS_ITEM_GROUPED_B
} from '../../../../../../../test/mocks/metrics';
import {TranslateServiceStub} from '../../../../../../../test/stubs/translate-service.stub';
import {State} from '../../../../../../app.reducers';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {NameValuePair} from '../../../../../../shared/misc/parsers/name-value-pair.parser';
import {BreakpointsEnum} from '../../../../../../shared/ui/constants/breakpoints.constant';
import {DIMENSIONS} from '../../../../../../shared/ui/constants/dimensions.constant';
import {DateParserStrategy} from '../../../../../../shared/ui/dates/date-parser.strategy';
import {MetricsResource} from '../../../../../project-common/api/metrics/resources/metrics.resource';
import {ProjectNumberOfWeeksEnum} from '../../../../../project-common/enums/project-number-of-weeks.enum';
import {ProjectDateParserStrategy} from '../../../../../project-common/helpers/project-date-parser.strategy';
import {MetricsActions} from '../../../../../project-common/store/metrics/metrics.actions';
import {MetricsQueries} from '../../../../../project-common/store/metrics/metrics.queries';
import {ProjectMetricsTimeFilters} from '../../../../../project-common/store/metrics/slice/project-metrics-filters';
import {ProjectPpcGroupedComponent} from './project-ppc-grouped.component';

describe('PPC Grouped component', () => {
    let comp: ProjectPpcGroupedComponent;
    let fixture: ComponentFixture<ProjectPpcGroupedComponent>;
    let debugElement: DebugElement;
    let store: Store<State>;
    let translateService: TranslateServiceStub;

    const dateParserStrategyMock: ProjectDateParserStrategy = mock(ProjectDateParserStrategy);

    const defaultLanguage = 'en';
    const referenceDate: moment.Moment = moment();
    const initialInnerWidth: number = window.innerWidth;

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

    const ppcGroupedTooltipInfoButtonSelector = '[data-automation="project-kpis-ppc-grouped-tooltip-info-button"]';
    const ppcGroupedTooltipInfoContentSelector = '[data-automation="project-ppc-grouped-tooltip-info"]';
    const ppcGroupedNoContentSelector = '[data-automation="project-ppc-grouped-no-items"]';

    const storeMock: Store<State> = mock(Store);
    const metricsQueriesMock: MetricsQueries = mock(MetricsQueries);

    const METRICS_TIME_FILTERS_4_WEEKS: ProjectMetricsTimeFilters = getTimeFiltersByDuration(ProjectNumberOfWeeksEnum.month);
    const METRICS_TIME_FILTERS_12_WEEKS: ProjectMetricsTimeFilters = getTimeFiltersByDuration(ProjectNumberOfWeeksEnum.trimester);

    const clickEvent: Event = new Event('click');

    const getPpcGroupedTooltipInfoButton = () => debugElement.query(By.css(ppcGroupedTooltipInfoButtonSelector)).nativeElement;
    const getPpcGroupedTooltipInfoContent = () => document.querySelectorAll(ppcGroupedTooltipInfoContentSelector);
    const getPpcGroupedNoContent = () => document.querySelectorAll(ppcGroupedNoContentSelector);

    const getMockMetricsResource = (companyName: string, craftName: string): MetricsResource => ({
        ...MOCK_METRICS_ITEM_GROUPED_A,
        company: companyName ? {id: companyName, displayName: companyName} : undefined,
        projectCraft: craftName ? {id: craftName, displayName: craftName} : undefined,
    });

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        declarations: [
            ProjectPpcGroupedComponent,
        ],
        imports: [TranslateModule.forRoot()],
        providers: [
            {
                provide: DateParserStrategy,
                useValue: instance(dateParserStrategyMock),
            },
            {
                provide: Store,
                useValue: instance(storeMock),
            },
            {
                provide: MetricsQueries,
                useValue: instance(metricsQueriesMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectPpcGroupedComponent);
        comp = fixture.componentInstance;
        debugElement = fixture.debugElement;

        when(dateParserStrategyMock.week(anything())).thenReturn(1);
        when(metricsQueriesMock.observeTimeFilters()).thenReturn(of(METRICS_TIME_FILTERS_4_WEEKS));
        when(metricsQueriesMock.observeFulfilledDayCardsGrouped()).thenReturn(of([MOCK_METRICS_ITEM_GROUPED_A]));
        when(metricsQueriesMock.observeFulfilledDayCardsGroupedRequestStatus()).thenReturn(of(RequestStatusEnum.success));

        store = TestBed.inject(Store);
        translateService = TestBed.inject<TranslateServiceStub>(TranslateService as any);

        translateService.setDefaultLang(defaultLanguage);

        fixture.detectChanges();

    });

    afterAll(() => updateWindowInnerWidth(initialInnerWidth));

    it('should create the component', () => {
        expect(comp).toBeDefined();
    });

    it('should dispatch request for FulfilledDayCardsAll action when time filter changes', () => {
        const expectedResult = new MetricsActions.Request.FulfilledDayCardsGrouped();

        spyOn(store, 'dispatch').and.callThrough();

        when(metricsQueriesMock.observeTimeFilters()).thenReturn(of(METRICS_TIME_FILTERS_12_WEEKS));

        comp.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should set loading in progress when request status is in progress', () => {
        when(metricsQueriesMock.observeFulfilledDayCardsGroupedRequestStatus()).thenReturn(of(RequestStatusEnum.progress));

        comp.ngOnInit();

        expect(comp.isLoading).toBeTruthy();
    });

    it('should unset loading in progress when request status is successful', () => {
        when(metricsQueriesMock.observeFulfilledDayCardsGroupedRequestStatus()).thenReturn(of(RequestStatusEnum.success));

        comp.ngOnInit();

        expect(comp.isLoading).toBeFalsy();
    });

    it('should render the info tooltip when user clicks in the info button', (done) => {
        getPpcGroupedTooltipInfoButton().dispatchEvent(clickEvent);

        setTimeout(() => {
            expect(getPpcGroupedTooltipInfoContent()).toBeDefined();
            done();
        }, 1);

    });

    it('should format label without unit for extra small screens', () => {
        updateWindowInnerWidth(BreakpointsEnum.xs);
        expect(comp.trafficLightSettings.valueFormatter(100)).toBe('100');
    });

    it('should format label without unit for small screens', () => {
        updateWindowInnerWidth(BreakpointsEnum.sm);
        expect(comp.trafficLightSettings.valueFormatter(80)).toBe('80');
    });

    it('should format label with unit for medium screens', () => {
        updateWindowInnerWidth(BreakpointsEnum.md);
        expect(comp.trafficLightSettings.valueFormatter(60)).toBe('60 %');
    });

    it('should format label with unit for large screens', () => {
        updateWindowInnerWidth(BreakpointsEnum.lg);
        expect(comp.trafficLightSettings.valueFormatter(40)).toBe('40 %');
    });

    it('should format label with unit for extra large screens', () => {
        updateWindowInnerWidth(BreakpointsEnum.xl);
        expect(comp.trafficLightSettings.valueFormatter(20)).toBe('20 %');
    });

    it('should format label with 0 when value is null', () => {
        updateWindowInnerWidth(BreakpointsEnum.xl);
        expect(comp.trafficLightSettings.valueFormatter(null)).toBe('0 %');

        updateWindowInnerWidth(BreakpointsEnum.sm);
        expect(comp.trafficLightSettings.valueFormatter(null)).toBe('0');
    });

    it('should format label with 0 when value is undefined', () => {
        when(metricsQueriesMock.observeTimeFilters()).thenReturn(of(METRICS_TIME_FILTERS_4_WEEKS));

        comp.ngOnInit();

        expect(comp.trafficLightSettings.valueFormatter(null)).toBe('0');
    });

    it('should change icon size to BASE_DIMENSION when metrics time filters is 12 Weeks', () => {
        when(metricsQueriesMock.observeTimeFilters()).thenReturn(of(METRICS_TIME_FILTERS_12_WEEKS));

        comp.ngOnInit();

        expect(comp.trafficLightSettings.size).toBe(DIMENSIONS.base_dimension);
    });

    it('should change icon size to base_dimension__x2 when metrics time filters is 4 Weeks', () => {
        when(metricsQueriesMock.observeTimeFilters()).thenReturn(of(METRICS_TIME_FILTERS_4_WEEKS));

        comp.ngOnInit();

        expect(comp.trafficLightSettings.size).toBe(DIMENSIONS.base_dimension__x2);
    });

    it('should have 0 columns when no data', () => {
        when(metricsQueriesMock.observeFulfilledDayCardsGrouped()).thenReturn(of([]));

        comp.ngOnInit();

        expect(comp.columns).toEqual([]);
    });

    it('should display empty message when no data', (done) => {
        when(metricsQueriesMock.observeFulfilledDayCardsGrouped()).thenReturn(of([]));

        comp.ngOnInit();

        setTimeout(() => {
            expect(getPpcGroupedNoContent()).toBeDefined();
            done();
        }, 1);
    });

    it('should show total column when current breakpoint is medium or higher', () => {
        updateWindowInnerWidth(BreakpointsEnum.md);

        expect(comp.addTotalColumn).toBeTruthy();
    });

    it('should not show total column when current breakpoint is less than medium', () => {
        updateWindowInnerWidth(BreakpointsEnum.sm);

        expect(comp.addTotalColumn).toBeFalsy();
    });

    it('should set the daycard reasons in a descending order of their values and alphabetically ascending', () => {
        comp.rows.forEach(row =>
            row.cells.forEach(cell =>
                expect(isSortValid(cell.reasons)).toBeTruthy()
            )
        );
    });

    it('should set Generic_NoCompany as row title for daycards without company', () => {
        const expectedTitle = 'Generic_NoCompany';

        when(metricsQueriesMock.observeFulfilledDayCardsGrouped()).thenReturn(of([MOCK_METRICS_ITEM_GROUPED_B]));
        spyOn(translateService, 'instant').and.callThrough();

        comp.ngOnInit();

        expect(translateService.instant).toHaveBeenCalledWith(expectedTitle);
        expect(comp.rows[0].title).toBe(expectedTitle);
    });

    it('should sort the rows by company name and craft name alphabetically ascending, with rows without company at the bottom', () => {
        const expectedRows: { title: string; subtitle: string }[] = [
            {title: 'A', subtitle: 'A'},
            {title: 'A', subtitle: 'B'},
            {title: 'Z', subtitle: 'Z'},
            {title: 'Z', subtitle: ''},
            {title: 'Generic_NoCompany', subtitle: 'A'},
            {title: 'Generic_NoCompany', subtitle: 'B'},
            {title: 'Generic_NoCompany', subtitle: ''},
        ];
        const fulfilledDayCards: MetricsResource[] = [
            getMockMetricsResource('A', 'A'),
            getMockMetricsResource('A', 'B'),
            getMockMetricsResource('Z', 'Z'),
            getMockMetricsResource('Z', undefined),
            getMockMetricsResource(undefined, 'A'),
            getMockMetricsResource(undefined, 'B'),
            getMockMetricsResource(undefined, undefined),
        ].reverse();

        when(metricsQueriesMock.observeFulfilledDayCardsGrouped()).thenReturn(of(fulfilledDayCards));
        comp.ngOnInit();

        expect(comp.rows.map(({title, subtitle}) => ({title, subtitle}))).toEqual(expectedRows);
    });
});
