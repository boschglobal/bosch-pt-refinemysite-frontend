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
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {TranslateModule} from '@ngx-translate/core';
import {DataItem} from '@swimlane/ngx-charts/lib/models/chart-data.model';
import {
    anything,
    instance,
    mock,
    when
} from 'ts-mockito';

import {MOCK_METRICS_RFV_ALL_A} from '../../../../../../../test/mocks/metrics';
import {NameSeriesPair} from '../../../../../../shared/misc/parsers/name-series-pair.parser';
import {NameValuePair} from '../../../../../../shared/misc/parsers/name-value-pair.parser';
import {DateParserStrategy} from '../../../../../../shared/ui/dates/date-parser.strategy';
import {DayCardMetricsResourceRfv} from '../../../../../project-common/api/metrics/resources/metrics.resource';
import {ProjectDateParserStrategy} from '../../../../../project-common/helpers/project-date-parser.strategy';
import {ProjectKpisListItem} from '../kpis-list/project-kpis-list.component';
import {ProjectRfvCrChartLineComponent} from './project-rfv-cr-chart-line.component';

describe('Project Rfv Cr Chart Line Component', () => {
    let component: ProjectRfvCrChartLineComponent;
    let fixture: ComponentFixture<ProjectRfvCrChartLineComponent>;

    const dateParserStrategyMock: ProjectDateParserStrategy = mock(ProjectDateParserStrategy);

    const referenceDate = '2019-04-15';
    const referenceDateWeekNumber = 16;
    const getRfvValueByRfvEnum = (key: string, list: DayCardMetricsResourceRfv[] = []) => {
        const rfv = list.find(({reason}) => reason.key === key);
        return rfv ? rfv.value : 0;
    };
    const chartData = MOCK_METRICS_RFV_ALL_A.totals.rfv.map(({reason: {key, name}}) => ({
        name,
        series: MOCK_METRICS_RFV_ALL_A.series.map(entry => ({
            name: entry.start.toString(),
            value: getRfvValueByRfvEnum(key, entry.metrics.rfv),
        }) as NameValuePair),
    }) as NameSeriesPair);

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslateModule.forRoot(),
        ],
        declarations: [
            ProjectRfvCrChartLineComponent,
        ],
        providers: [
            {
                provide: DateParserStrategy,
                useValue: instance(dateParserStrategyMock),
            },
        ],
    };

    when(dateParserStrategyMock.week(anything())).thenReturn(referenceDateWeekNumber);

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectRfvCrChartLineComponent);
        component = fixture.componentInstance;

        component.chartData = chartData;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should retrieve the correct week label when name attribute exists', () => {
        const data: DataItem[] = [{name: referenceDate, value: 0}];

        expect(component.getWeekLabel(data)).toBe(referenceDateWeekNumber.toString());
    });

    it('should retrieve the correct week label when name attribute does not exist', () => {
        const data: DataItem[] = [{} as DataItem];

        expect(component.getWeekLabel(data)).toBe('');
    });

    it('should retrieve the correct value when there are weekly RFVs', () => {
        const list = [{value: null}, {value: 12}];

        expect(component.hasWeeklyRfvs(list)).toBe(1);
    });

    it('should retrieve the correct value when there are no weekly RFVs', () => {
        const list = [{value: 0}, {value: 0}];

        expect(component.hasWeeklyRfvs(list)).toBeNull();
    });

    it('should retrieve filtered and ordered RFV list', () => {
        const data = [
            {value: 1, series: 'foo', color: '#333'},
            {value: 0, series: 'bar', color: '#444'},
            {value: 10, series: 'zoo', color: '#555'}];

        const expectedResult: ProjectKpisListItem[] = data
            .map(item => ({
                name: item.series,
                color: item.color,
                value: item.value,
            }) as ProjectKpisListItem)
            .filter(item => item.value !== 0).reverse();

        expect(component.getWeekRfvList(data)).toEqual(expectedResult);
    });

    it('should format correctly a decimal number to empty string', () => {
        expect(component.graphSettings.yAxisTickFormatting(1.1)).toEqual('');
    });

    it('should format correctly a int number', () => {
        expect(component.graphSettings.yAxisTickFormatting(1)).toEqual(1);
    });

    it('should set defaults when inputs are not set', () => {
        component.chartData = null;
        component.seriesColors = null;

        expect(component.graphSettings.customColors).toEqual([]);
        expect(component.graphSettings.results).toEqual([]);
    });

    it('should use default xAxisTickFormatting function', () => {
        expect(component.graphSettings.xAxisTickFormatting(1)).toBe(1);
    });

    it('should use custom xAxisTickFormatting function', () => {
        const data = 1;
        const expectedResult = data * 2;

        component.settings = {xAxisTickFormatting: (value) => value + value};

        expect(component.graphSettings.xAxisTickFormatting(data)).toEqual(expectedResult);
    });
});
