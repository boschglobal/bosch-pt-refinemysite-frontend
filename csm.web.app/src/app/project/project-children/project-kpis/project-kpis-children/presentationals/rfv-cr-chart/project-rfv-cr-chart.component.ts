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
import {ChartTypeEnum} from '../../../../../project-common/enums/chart-type.enum';

@Component({
    selector: 'ss-project-rfv-cr-chart',
    templateUrl: './project-rfv-cr-chart.component.html',
    styleUrls: ['./project-rfv-cr-chart.component.scss']
})
export class ProjectRfvCrChartComponent {

    @Input()
    public chartData: NameSeriesPair[];

    @Input()
    public chartSeriesColors: NameValuePair[];

    @Input()
    public currentChart: ChartTypeEnum;

    @Input()
    public settings;

    public chartType = ChartTypeEnum;
}
