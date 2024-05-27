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

export interface PpcGroupedTableColumn {
    title: string;
    subtitle?: string;
}

export interface PpcGroupedTableCell {
    ppc: number;
    week: string;
    reasons: NameValuePair[];
}

export interface PpcGroupedTableRow {
    title: string;
    subtitle: string;
    cells: PpcGroupedTableCell[];
}

@Component({
    selector: 'ss-ppc-grouped-table',
    templateUrl: './ppc-grouped-table.component.html',
    styleUrls: ['./ppc-grouped-table.component.scss']
})
export class PpcGroupedTableComponent {
    @Input() public columns: PpcGroupedTableColumn[] = [];

    @Input() public trafficLightSettings: TrafficLightWithLabelSettings;

    @Input() public rows: PpcGroupedTableRow[] = [];

    @Input() public showTotalsColumn = false;

    constructor() {
    }

    public getColSpan(row: PpcGroupedTableRow): number {
        return this.showTotalsColumn ? this.columns.length - 1 : this.columns.length;
    }

}
