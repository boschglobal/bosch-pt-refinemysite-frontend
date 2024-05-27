/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {TableSettings} from './table.component';

@Component({
    template: `
        <ss-table [records]="records"
                  [settings]="settings"
                  [selectedRows]="selectedRows"
                  [isSelecting]="isSelecting">
            <ss-table-cell [field]="'a'"></ss-table-cell>
            <ss-table-cell [field]="'b'"></ss-table-cell>
            <ss-table-cell [field]="'c'">
                <ng-template let-c>
                    <h1>{{c}}</h1>
                </ng-template>
            </ss-table-cell>
        </ss-table>
    `
})
export class TableTestComponent {
    public records: any[];
    public selectedRows: string[];
    public settings: TableSettings;
    public isSelecting: boolean;
}
