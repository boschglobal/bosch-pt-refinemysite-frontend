/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    Input
} from '@angular/core';
import {DataItem} from '@swimlane/ngx-charts/lib/models/chart-data.model';
import * as moment from 'moment';

import {NameSeriesPair} from '../../../../../../shared/misc/parsers/name-series-pair.parser';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../../../shared/rest/constants/date-format.constant';
import {DateParserStrategy} from '../../../../../../shared/ui/dates/date-parser.strategy';
import {ProjectKpisListItem} from '../kpis-list/project-kpis-list.component';

@Component({
    selector: 'ss-project-rfv-cr-chart-line',
    templateUrl: './project-rfv-cr-chart-line.component.html',
    styleUrls: ['./project-rfv-cr-chart-line.component.scss'],
})
export class ProjectRfvCrChartLineComponent {

    @Input()
    public set seriesColors(colors: string[]) {
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
        seriesTooltipDisabled: false,
        tooltipDisabled: false,
        xAxis: true,
        xAxisTickFormatting: (value: any) => value,
        yAxis: true,
        yAxisTickFormatting: (value: number) => value % 1 === 0 ? Math.trunc(value) : '',
        yScaleMax: null,
    };

    constructor(private _dateParser: DateParserStrategy) {
    }

    public getWeekLabel(list: DataItem[]): string {
        return list[0].name
            ? this._dateParser.week(moment(list[0].name, API_DATE_YEAR_MONTH_DAY_FORMAT)).toString()
            : '';
    }

    public getWeekRfvList(list): ProjectKpisListItem[] {
        return list
            .filter(item => item.value !== 0)
            .map(item => ({
                name: item.series,
                color: item.color,
                value: item.value,
            }) as ProjectKpisListItem)
            .sort((a, b) => b.value - a.value);
    }

    public hasWeeklyRfvs(list): number | null {
        return list.filter(item => item.value !== 0).length > 0 ? 1 : null;
    }

}
