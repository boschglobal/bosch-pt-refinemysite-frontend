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

import {MOCK_METRICS_RFV_ALL_A} from '../../../../../../../test/mocks/metrics';
import {NameSeriesPair} from '../../../../../../shared/misc/parsers/name-series-pair.parser';
import {NameValuePair} from '../../../../../../shared/misc/parsers/name-value-pair.parser';
import {DayCardMetricsResourceRfv} from '../../../../../project-common/api/metrics/resources/metrics.resource';
import {REASONS_FOR_VARIANCE_COLORS} from '../../../../../project-common/constants/reasons-for-variance-colors.constant';
import {ProjectRfvCrChartBarGroupedComponent} from './project-rfv-cr-chart-bar-grouped.component';

describe('ProjectRfvCrChartBarGroupedComponent', () => {
    let component: ProjectRfvCrChartBarGroupedComponent;
    let fixture: ComponentFixture<ProjectRfvCrChartBarGroupedComponent>;

    const seriesColors: NameValuePair[] = Object.keys(REASONS_FOR_VARIANCE_COLORS).map(key => ({
        name: key,
        value: REASONS_FOR_VARIANCE_COLORS[key].normal
    }) as NameValuePair);

    const getRfvValueByRfvEnum = (key: string, list: DayCardMetricsResourceRfv[] = []) => {
        const rfv = list.find(({reason}) => reason.key === key);
        return rfv ? rfv.value : 0;
    };

    const chartData = MOCK_METRICS_RFV_ALL_A.series.map(week => ({
        name: week.start.toString(),
        series: Object.keys(REASONS_FOR_VARIANCE_COLORS)
            .map(item => ({
                name: item,
                value: getRfvValueByRfvEnum(item, week.metrics.rfv)
            } as NameValuePair)).reverse()
    } as NameSeriesPair));

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA
        ],
        imports: [
            TranslateModule.forRoot(),
        ],
        declarations: [
            ProjectRfvCrChartBarGroupedComponent
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectRfvCrChartBarGroupedComponent);
        component = fixture.componentInstance;

        component.chartData = chartData;
        component.seriesColors = seriesColors;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
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

    it('should retrieve the correct RFV item description', () => {
        const item = {label: 'foo', value: '111'};
        const expectedResult = [{name: item.label, value: item.value}];

        expect(component.getRfvDescription(item)).toEqual(expectedResult);
    });
});
