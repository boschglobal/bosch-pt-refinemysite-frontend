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
import {DIMENSIONS} from '../../../../../../shared/ui/constants/dimensions.constant';

@Component({
    selector: 'ss-project-rfv-cr-chart-bar-grouped',
    templateUrl: './project-rfv-cr-chart-bar-grouped.component.html',
    styleUrls: ['./project-rfv-cr-chart-bar-grouped.component.scss']
})
export class ProjectRfvCrChartBarGroupedComponent {

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
        barPadding: DIMENSIONS.base_dimension__x05,
        customColors: [],
        groupPadding: DIMENSIONS.base_dimension,
        results: [],
        roundEdges: false,
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
