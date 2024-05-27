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
import {
    cloneDeep,
    flatten
} from 'lodash';
import * as moment from 'moment';
import {Moment} from 'moment';
import {of} from 'rxjs';
import {
    anything,
    instance,
    mock,
    when
} from 'ts-mockito';

import {updateWindowInnerWidth} from '../../../../../../../test/helpers';
import {MOCK_METRICS_RFV_ALL_A} from '../../../../../../../test/mocks/metrics';
import {MOCK_RFV_BAD_WEATHER_ENUM_REFERENCE} from '../../../../../../../test/mocks/rfvs';
import {TranslateServiceStub} from '../../../../../../../test/stubs/translate-service.stub';
import {State} from '../../../../../../app.reducers';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {BreakpointHelper} from '../../../../../../shared/misc/helpers/breakpoint.helper';
import {BreakpointsEnum} from '../../../../../../shared/ui/constants/breakpoints.constant';
import {DateParserStrategy} from '../../../../../../shared/ui/dates/date-parser.strategy';
import {FlyoutDirective} from '../../../../../../shared/ui/flyout/directive/flyout.directive';
import {FlyoutTooltipComponent} from '../../../../../../shared/ui/flyout-tooltip/flyout-tooltip.component';
import {MenuItem} from '../../../../../../shared/ui/menus/menu-list/menu-list.component';
import {REASONS_FOR_VARIANCE_COLORS} from '../../../../../project-common/constants/reasons-for-variance-colors.constant';
import {ChartTypeEnum} from '../../../../../project-common/enums/chart-type.enum';
import {ProjectNumberOfWeeksEnum} from '../../../../../project-common/enums/project-number-of-weeks.enum';
import {ProjectDateParserStrategy} from '../../../../../project-common/helpers/project-date-parser.strategy';
import {MetricsActions} from '../../../../../project-common/store/metrics/metrics.actions';
import {MetricsQueries} from '../../../../../project-common/store/metrics/metrics.queries';
import {ProjectMetricsTimeFilters} from '../../../../../project-common/store/metrics/slice/project-metrics-filters';
import {ProjectRfvCrLegendListItem} from '../../presentationals/rfv-cr-legend/project-rfv-cr-legend.component';
import {ProjectRfvCrComponent} from './project-rfv-cr.component';

describe('KPIs RFV Course of Reasons component', () => {
    let component: ProjectRfvCrComponent;
    let fixture: ComponentFixture<ProjectRfvCrComponent>;
    let debugElement: DebugElement;
    let store: Store<State>;
    let translateService: TranslateServiceStub;

    const dateParserStrategyMock: ProjectDateParserStrategy = mock(ProjectDateParserStrategy);

    const languageDEIdentifier = 'de';
    const languageENIdentifier = 'en';
    const referenceDate: Moment = moment();
    const referenceDateWeekNumber = referenceDate.week();
    const clickEvent: Event = new Event('click');
    const initialInnerWidth: number = window.innerWidth;
    const storeMock: Store<State> = mock(Store);
    const metricsQueriesMock: MetricsQueries = mock(MetricsQueries);
    const breakpointHelperMock: BreakpointHelper = mock(BreakpointHelper);
    const rfvCrTooltipInfoButtonSelector = '[data-automation="project-rfv-cr-tooltip-info-button"]';
    const rfvCrTooltipInfoContentSelector = '[data-automation="project-rfv-cr-tooltip-info"]';
    const rfvCrEmptyStateSelector = '[data-automation="project-rfv-cr-no-items"]';
    const getRfvCrTooltipInfoButton = () => debugElement.query(By.css(rfvCrTooltipInfoButtonSelector)).nativeElement;
    const getRfvCrTooltipInfoContent = () => document.querySelectorAll(rfvCrTooltipInfoContentSelector);
    const getRfvCrEmptyStateContent = () => document.querySelectorAll(rfvCrEmptyStateSelector);
    const getTimeFiltersByDuration = (duration: number) => ({
        duration,
        startDate: referenceDate.clone().startOf('week').subtract(duration, 'week').format('YYYY-MM-DD'),
    } as ProjectMetricsTimeFilters);
    const getChartTypeList = (itemId: string): MenuItem =>
        flatten(component.chartTypeList.map(({items}) => items)).find(item => item.id === itemId);

    const METRICS_TIME_FILTERS_4_WEEKS: ProjectMetricsTimeFilters = getTimeFiltersByDuration(ProjectNumberOfWeeksEnum.month);
    const METRICS_TIME_FILTERS_12_WEEKS: ProjectMetricsTimeFilters = getTimeFiltersByDuration(ProjectNumberOfWeeksEnum.trimester);
    const controlListItems: ProjectRfvCrLegendListItem[] = MOCK_METRICS_RFV_ALL_A.totals.rfv.map(item => ({
        id: item.reason.key,
        name: item.reason.name,
        active: false,
        color: REASONS_FOR_VARIANCE_COLORS[item.reason.key].normal,
    }) as ProjectRfvCrLegendListItem);

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
            ProjectRfvCrComponent,
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
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectRfvCrComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;

        when(breakpointHelperMock.breakpointChange()).thenReturn(of(BreakpointsEnum.lg.toString()));
        when(dateParserStrategyMock.week(anything())).thenReturn(referenceDateWeekNumber);
        when(metricsQueriesMock.observeTimeFilters()).thenReturn(of(METRICS_TIME_FILTERS_4_WEEKS));
        when(metricsQueriesMock.observeReasonsForVarianceAll()).thenReturn(of(MOCK_METRICS_RFV_ALL_A));
        when(metricsQueriesMock.observeReasonsForVarianceAllRequestStatus()).thenReturn(of(RequestStatusEnum.success));

        component.ngOnInit();

        store = TestBed.inject(Store);
        translateService = TestBed.inject<TranslateServiceStub>(TranslateService as any);

        fixture.detectChanges();
    });

    afterAll(() => {
        fixture.destroy();
        updateWindowInnerWidth(initialInnerWidth);
        translateService.setDefaultLang(languageENIdentifier);
    });

    it('should create RFV Course of Reasons component', () => {
        expect(component).toBeTruthy();
    });

    it('should render the info tooltip when user clicks in the info button', (done) => {
        getRfvCrTooltipInfoButton().dispatchEvent(clickEvent);

        setTimeout(() => {
            expect(getRfvCrTooltipInfoContent()).toBeDefined();
            done();
        }, 1);
    });

    it('should dispatch request for ReasonsForVarianceAll action when time filter changes', () => {
        const expectedResult = new MetricsActions.Request.ReasonsForVarianceAll();

        spyOn(store, 'dispatch').and.callThrough();

        when(metricsQueriesMock.observeTimeFilters()).thenReturn(of(METRICS_TIME_FILTERS_12_WEEKS));

        component.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should set load in progress when request status is in progress', () => {
        when(metricsQueriesMock.observeReasonsForVarianceAllRequestStatus()).thenReturn(of(RequestStatusEnum.progress));

        component.ngOnInit();

        expect(component.isLoading).toBeTruthy();
    });

    it('should unset load in progress when request status is successful', () => {
        when(metricsQueriesMock.observeReasonsForVarianceAllRequestStatus()).thenReturn(of(RequestStatusEnum.success));

        component.ngOnInit();

        expect(component.isLoading).toBeFalsy();
    });

    it('should set chartData correctly based on a given chart type selected', () => {
        when(metricsQueriesMock.observeTimeFilters()).thenReturn(of(METRICS_TIME_FILTERS_12_WEEKS));
        when(metricsQueriesMock.observeReasonsForVarianceAll()).thenReturn(of(MOCK_METRICS_RFV_ALL_A));

        component.currentChart = ChartTypeEnum.Line;

        component.ngOnInit();

        expect(component.chartData.length).toEqual(component.rfvControlList.length);
    });

    it('should filter data correctly based on control list items active state for a given chart type selected', () => {
        const controlListCopy = cloneDeep(controlListItems);
        const controlListItem = controlListCopy.find(item => item.id === 'MANPOWER_SHORTAGE');
        controlListItem.active = true;

        component.currentChart = ChartTypeEnum.GroupedBar;
        component.rfvControlList = controlListCopy;

        component.ngOnInit();

        component.chartData.forEach(item => expect(item.series.length).toEqual(1));
    });

    it('should return correct empty values of series item when there is no RFV data for a given chart type selected', () => {
        const data = cloneDeep(MOCK_METRICS_RFV_ALL_A);
        data.series.forEach(item => item.metrics = {});

        component.currentChart = ChartTypeEnum.Line;

        when(metricsQueriesMock.observeReasonsForVarianceAll()).thenReturn(of(data));

        component.ngOnInit();

        component.chartData.forEach(item => {
            expect(item.series.find(serie => serie.value !== 0)).toBeUndefined();
        });
    });

    it('should filter control list items on metrics totals data', () => {
        const data = cloneDeep(MOCK_METRICS_RFV_ALL_A);
        data.totals.rfv = [
            {
                reason: MOCK_RFV_BAD_WEATHER_ENUM_REFERENCE,
                value: 5,
            },
        ];

        when(metricsQueriesMock.observeReasonsForVarianceAll()).thenReturn(of(data));

        component.ngOnInit();

        expect(component.rfvControlList.length).toBe(1);
    });

    it('should filter control list items when metrics totals data is empty', () => {
        const data = cloneDeep(MOCK_METRICS_RFV_ALL_A);
        data.totals.rfv = [];

        when(metricsQueriesMock.observeReasonsForVarianceAll()).thenReturn(of(data));

        component.ngOnInit();

        expect(component.rfvControlList.length).toBe(0);
    });

    it('should toggle state change to active on a given control list item', () => {
        const item = controlListItems[0];
        item.active = false;
        component.rfvControlListItemSelection(item);

        expect(item.active).toBeTruthy();
    });

    it('should toggle state change to inactive on a given control list item', () => {
        const item = controlListItems[0];
        item.active = true;
        component.rfvControlListItemSelection(item);

        expect(item.active).toBeFalsy();
    });

    it('should reset active state for all control list items when resetRfvControlList function is called', () => {
        const items = controlListItems.map(item => Object.assign({}, {active: true}, item));
        component.rfvControlList = items;

        component.resetRfvControlList();

        for (let i = 0, leni = items.length; i < leni; i++) {
            expect(items[i].active).toBeFalsy();
        }
    });

    it('should reset active state for all control list items when resolution is less then MD', () => {
        when(breakpointHelperMock.breakpointChange()).thenReturn(of(BreakpointsEnum.xs.toString()));

        updateWindowInnerWidth(BreakpointsEnum.xs);

        fixture.detectChanges();

        const items = component.rfvControlList;

        for (let i = 0, leni = items.length; i < leni; i++) {
            expect(items[i].active).toBeFalsy();
        }
    });

    it('should update RFV series color when mouse actions callbacks are triggered over a control list item', () => {
        const controlListCopy = cloneDeep(controlListItems);
        const controlListActorItem = controlListCopy.find(rfv => rfv.id === 'MANPOWER_SHORTAGE');

        component.rfvControlList = controlListCopy;

        component.toggleRfvSerieColor(controlListActorItem, true);

        component.rfvSeriesColor.forEach(serie => {
            if (serie.name === controlListActorItem.name) {
                return;
            }
            const rfv = component.rfvControlList.find(item => item.name === serie.name);
            expect(serie.value).toEqual(REASONS_FOR_VARIANCE_COLORS[rfv.id].faded);
        });

        component.toggleRfvSerieColor(controlListActorItem, false);

        component.rfvSeriesColor.forEach(serie => {
            if (serie.name === controlListActorItem.name) {
                return;
            }
            const rfv = component.rfvControlList.find(item => item.name === serie.name);
            expect(serie.value).toEqual(REASONS_FOR_VARIANCE_COLORS[rfv.id].normal);
        });
    });

    it('should not update RFV series color for an inactive list item when mouse actions callbacks are triggered', () => {
        const controlListCopy = cloneDeep(controlListItems);
        const activeItem = controlListCopy[0];
        const inactiveItem = controlListCopy[1];

        component.rfvControlList = controlListCopy;
        component.rfvControlListItemSelection(activeItem);

        const expectedResult = cloneDeep(component.rfvSeriesColor);

        component.toggleRfvSerieColor(inactiveItem, true);

        expect(component.rfvSeriesColor).toEqual(expectedResult);

        component.toggleRfvSerieColor(inactiveItem, false);

        expect(component.rfvSeriesColor).toEqual(expectedResult);
    });

    it('should update current chart type when chart selection changes', () => {
        const stackedBarChart = getChartTypeList(ChartTypeEnum.StackedBar);

        component.handleChartTypeChange(stackedBarChart);

        expect(component.currentChart).toBe(stackedBarChart.id);
    });

    it('should format xAxisTickFormatting label correctly for 4 weeks time filters', () => {
        const referenceDateString = referenceDate.format('YYYY-MM-DD');
        const expectedResult = `Generic_Week ${referenceDateWeekNumber.toString()}`;

        updateWindowInnerWidth(BreakpointsEnum.md);

        when(metricsQueriesMock.observeTimeFilters()).thenReturn(of(METRICS_TIME_FILTERS_4_WEEKS));

        component.ngOnInit();

        expect(component.reasonsForVarianceAllChartSettings.xAxisTickFormatting(referenceDateString)).toEqual(expectedResult);
    });

    it('should format xAxisTickFormatting label correctly for 12 weeks time filters', () => {
        const referenceDateString = referenceDate.format('YYYY-MM-DD');
        const expectedResult = referenceDateWeekNumber.toString();

        when(metricsQueriesMock.observeTimeFilters()).thenReturn(of(METRICS_TIME_FILTERS_12_WEEKS));

        updateWindowInnerWidth(BreakpointsEnum.md);

        component.ngOnInit();

        expect(component.reasonsForVarianceAllChartSettings.xAxisTickFormatting(referenceDateString)).toEqual(expectedResult);
    });

    it('should set yScaleMax with the correct value for line chart and grouped bar chart', () => {
        const maxValue = 99999;
        const expectedResult = maxValue;
        const data = cloneDeep(MOCK_METRICS_RFV_ALL_A);
        data.series.find(item => {
            if (!item.metrics || !item.metrics.rfv) {
                return false;
            }
            const entry = item.metrics.rfv.find(rfv => rfv.value !== 0);
            entry.value = maxValue;
            return true;
        });

        component.currentChart = ChartTypeEnum.Line;

        when(metricsQueriesMock.observeReasonsForVarianceAll()).thenReturn(of(data));

        component.ngOnInit();

        expect(component.reasonsForVarianceAllChartSettings.yScaleMax).toEqual(expectedResult);

        component.currentChart = ChartTypeEnum.GroupedBar;

        fixture.detectChanges();

        expect(component.reasonsForVarianceAllChartSettings.yScaleMax).toEqual(expectedResult);
    });

    it('should set yScaleMax with the correct value for stacked bar chart', () => {
        const data = cloneDeep(MOCK_METRICS_RFV_ALL_A);
        const expectedResult = data.series.reduce((acc, curr) => {
            const weekSum = (curr.metrics.rfv || []).reduce((ac, cur) => cur.value + ac, 0);
            return weekSum > acc ? weekSum : acc;
        }, 0);

        component.currentChart = ChartTypeEnum.StackedBar;

        when(metricsQueriesMock.observeReasonsForVarianceAll()).thenReturn(of(data));

        component.ngOnInit();

        expect(component.reasonsForVarianceAllChartSettings.yScaleMax).toEqual(expectedResult);
    });

    it('should display empty state when there is no data', () => {
        const data = cloneDeep(MOCK_METRICS_RFV_ALL_A);
        data.totals.rfv = [];

        when(metricsQueriesMock.observeReasonsForVarianceAll()).thenReturn(of(data));

        component.ngOnInit();

        expect(getRfvCrEmptyStateContent()).toBeDefined();
        expect(component.noReasonsForVarianceAllData).toBeTruthy();
    });

    it('should dispatch request for ReasonsForVarianceAll action when language changes', () => {
        const expectedResult = new MetricsActions.Request.ReasonsForVarianceAll();

        spyOn(store, 'dispatch').and.callThrough();

        translateService.setDefaultLang(languageDEIdentifier);

        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });
});
