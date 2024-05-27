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

import {NameValuePair} from '../../../../../../shared/misc/parsers/name-value-pair.parser';
import {TrafficLightWithLabelSettings} from '../../../../../../shared/ui/traffic-light/traffic-light-with-label.component';
import {PROJECT_KPIS_COLOR_RANGES} from '../../../../../project-common/constants/project-kpis-color-ranges.constant';

@Component({
    selector: 'ss-project-kpis-tooltip',
    templateUrl: './project-kpis-tooltip.component.html',
    styleUrls: ['./project-kpis-tooltip.component.scss']
})
export class ProjectKpisTooltipComponent {

    @Input()
    public list: NameValuePair[] = [];

    @Input()
    public value: number;

    @Input()
    public weekLabel: string;

    @Input()
    public showFooter = true;

    @Input()
    public showTotal = false;

    public trafficLightWithLabelSettings: TrafficLightWithLabelSettings = {
        valueFormatter: value => `${value} %`,
        ranges: PROJECT_KPIS_COLOR_RANGES,
    };

    public hasTitle(): boolean {
        return this.weekLabel && this.weekLabel.length > 0;
    }

    public hasWeeklyDayCardsNotFulfilled(): boolean {
        return this.list.length > 0;
    }

    public hasWeeklyDayCardsFulfilled(): boolean {
        return this.value === 100;
    }

    public noWeeklyDayCardsPlanned(): boolean {
        return this.value === null || (this.value === 0 && !this.hasWeeklyDayCardsNotFulfilled());
    }
}
