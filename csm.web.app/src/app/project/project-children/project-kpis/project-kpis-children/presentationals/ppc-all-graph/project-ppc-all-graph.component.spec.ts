/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NO_ERRORS_SCHEMA} from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    TestModuleMetadata,
    tick,
    waitForAsync
} from '@angular/core/testing';
import {
    TranslateModule,
    TranslateService
} from '@ngx-translate/core';
import {cloneDeep} from 'lodash';
import * as moment from 'moment';
import {
    instance,
    mock
} from 'ts-mockito';

import {MOCK_METRICS_ITEM_ALL_A} from '../../../../../../../test/mocks/metrics';
import {TranslateServiceStub} from '../../../../../../../test/stubs/translate-service.stub';
import {
    NameSeriesPair,
    NameSeriesPairParser
} from '../../../../../../shared/misc/parsers/name-series-pair.parser';
import {NameValuePairParser} from '../../../../../../shared/misc/parsers/name-value-pair.parser';
import {DayCardMetricsResourceRfv} from '../../../../../project-common/api/metrics/resources/metrics.resource';
import {MetricsQueries} from '../../../../../project-common/store/metrics/metrics.queries';
import {ProjectPpcAllGraphComponent} from './project-ppc-all-graph.component';

describe('PPC All graph component', () => {
    let comp: ProjectPpcAllGraphComponent;
    let fixture: ComponentFixture<ProjectPpcAllGraphComponent>;

    const metricsQueriesMock: MetricsQueries = mock(MetricsQueries);
    const getWeekLabel = (date: string) => `Week ${moment(date, 'YYYY-MM-DD').week()}`;
    const seriesItemParser = (item) => ({
        name: getWeekLabel(item.start),
        value: (item.metrics.hasOwnProperty('ppc')) ? item.metrics.ppc : null
    });
    const nameValuePairParser = new NameValuePairParser(seriesItemParser);
    const nameSeriesPairParser = new NameSeriesPairParser('ProjectPpcAllGraph', nameValuePairParser);
    const KPIS_PPC_ALL_GRAPH_DATA: NameSeriesPair = nameSeriesPairParser.parse(MOCK_METRICS_ITEM_ALL_A.series);
    const rfvItemParser = (rfv: DayCardMetricsResourceRfv) => {
        const {reason: {name}, value} = rfv;
        return {value, name};
    };
    const KPIS_PPC_ALL_GRAPH_DATA_BY_WEEK = MOCK_METRICS_ITEM_ALL_A.series.map(item => ({
        name: getWeekLabel(item.start.toString()),
        value: (item.metrics.rfv || []).map(rfv => rfvItemParser(rfv))
    }));
    const seriesWithValue = KPIS_PPC_ALL_GRAPH_DATA.series.filter(serie => serie.value !== null);
    const mean = Math.round(seriesWithValue.reduce((a, c) => a + c.value, 0) / seriesWithValue.length);

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA
        ],
        imports: [
            TranslateModule.forRoot(),
        ],
        declarations: [
            ProjectPpcAllGraphComponent
        ],
        providers: [
            {
                provide: MetricsQueries,
                useValue: instance(metricsQueriesMock)
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub()
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectPpcAllGraphComponent);
        comp = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(comp).toBeDefined();
    });

    it('should set graph ticks labels when data changes', () => {
        comp.data = KPIS_PPC_ALL_GRAPH_DATA;

        const expectedResultYTicks = [0, 20, 40, 60, 80, 100, mean];
        const expectedResultXTicks = KPIS_PPC_ALL_GRAPH_DATA.series.map(serie => serie.name);

        expect(comp.graphSettings.xAxisTicks).toEqual(expectedResultXTicks);
        expect(comp.graphSettings.yAxisTicks).toEqual(expectedResultYTicks);
    });

    it('should retrieve the correct label for graph Y tick', () => {
        const expectedResult = '50%';

        comp.data = KPIS_PPC_ALL_GRAPH_DATA;

        expect(comp.graphSettings.yAxisTickFormatting(50)).toEqual(expectedResult);
    });

    it('should not display any results when there is no data', () => {
        const expectedResult = [
            {name: 'ProjectPccAllGraph', series: []},
        ];

        comp.data = {name: 'ProjectPccAllGraph', series: []};

        expect(comp.graphData).toEqual(expectedResult);
    });

    it('should format X tick with the correct value', () => {
        expect(comp.graphSettings.xAxisTickFormatting('40')).toBe('40');
    });

    it('should format X tick with the correct value when a formatter function is used', () => {
        const xTickValue = 100;
        const expectedResult = `${xTickValue} %`;

        comp.settings = {
            xAxisTickFormatting: (value) => `${value} %`
        };

        expect(comp.graphSettings.xAxisTickFormatting(xTickValue)).toBe(expectedResult);
    });

    it('should render empty label for Y tick when a given default tick overlaps mean reference line Y tick', () => {
        const data: NameSeriesPair = cloneDeep(KPIS_PPC_ALL_GRAPH_DATA);
        data.series.forEach(serie => serie.value = 40);

        comp.data = data;

        expect(comp.graphSettings.yAxisTickFormatting('40')).toBe('');
    });

    it('should render the correct mean value reference line', () => {
        comp.data = KPIS_PPC_ALL_GRAPH_DATA;

        expect(comp.graphSettings.referenceLines[0].value).toEqual(mean);
    });

    it('should return the correct RFVs for a given week', () => {
        const serie = MOCK_METRICS_ITEM_ALL_A.series[0];
        const weekName = getWeekLabel(serie.start.toString());
        const expectedResult = serie.metrics.rfv.map(item => rfvItemParser(item));

        comp.rfvListByWeek = KPIS_PPC_ALL_GRAPH_DATA_BY_WEEK;

        fixture.detectChanges();

        expect(comp.getWeekRfvList(weekName)).toEqual(expectedResult);
    });

    it('should reset and unreset graph data values after data changes', fakeAsync(() => {
        const finalResult: NameSeriesPair[] = [{
            ...KPIS_PPC_ALL_GRAPH_DATA,
            series: KPIS_PPC_ALL_GRAPH_DATA.series.map(serie => ({
                ...serie,
                value: serie.value || 0,
            }))
        }];
        const resetResult: NameSeriesPair[] = [{
            ...KPIS_PPC_ALL_GRAPH_DATA,
            series: KPIS_PPC_ALL_GRAPH_DATA.series.map(serie => ({
                ...serie,
                value: 0,
            }))
        }];

        comp.ngOnInit();
        comp.data = KPIS_PPC_ALL_GRAPH_DATA;

        expect(comp.graphData).toEqual(resetResult);
        tick(0);
        expect(comp.graphData).toEqual(finalResult);
    }));

    it('should normalize graph data to replace null values', fakeAsync(() => {
        const expectedResult: NameSeriesPair[] = [{
            ...KPIS_PPC_ALL_GRAPH_DATA,
            series: KPIS_PPC_ALL_GRAPH_DATA.series.map(serie => ({
                ...serie,
                value: serie.value || 0,
            }))
        }];

        comp.ngOnInit();
        comp.data = KPIS_PPC_ALL_GRAPH_DATA;

        tick(0);

        expect(comp.graphData).toEqual(expectedResult);
    }));

});
