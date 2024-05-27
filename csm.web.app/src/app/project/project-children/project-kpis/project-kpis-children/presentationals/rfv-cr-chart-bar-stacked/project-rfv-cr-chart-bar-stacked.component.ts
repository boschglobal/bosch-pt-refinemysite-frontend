/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
} from '@angular/core';

import {NameSeriesPair} from '../../../../../../shared/misc/parsers/name-series-pair.parser';
import {NameValuePair} from '../../../../../../shared/misc/parsers/name-value-pair.parser';

@Component({
    selector: 'ss-project-rfv-cr-chart-bar-stacked',
    templateUrl: './project-rfv-cr-chart-bar-stacked.component.html',
    styleUrls: ['./project-rfv-cr-chart-bar-stacked.component.scss']
})
export class ProjectRfvCrChartBarStackedComponent {
    @Input()
    public set seriesColors(colors: NameValuePair[]) {
        this.graphSettings.customColors = colors || [];
    }

    @Input()
    public set chartData(data: NameSeriesPair[]) {
        this.graphSettings.results = data || [];
    }

    @Input()
    public set settings(settings) {
        this.graphSettings = Object.assign(this.graphSettings, settings);
    }

    public graphSettings = {
        customColors: [],
        results: [],
        tooltipDisabled: false,
        xAxis: true,
        xAxisTickFormatting: (value: any) => value,
        yAxis: true,
        yAxisTickFormatting: (value: number) => value % 1 === 0 ? Math.trunc(value) : '',
        yScaleMax: null,
    };

    public getRfvDescription(item) {
        return [
            {
                name: item.label,
                value: item.value
            }
        ];
    }
}
