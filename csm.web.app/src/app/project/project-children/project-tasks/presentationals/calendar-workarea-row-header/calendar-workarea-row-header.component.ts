/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    Input,
} from '@angular/core';
export interface CalendarWorkareaRowHeaderModel {
    id: string;
    name: string;
    position: number;
}

@Component({
    selector: 'ss-calendar-workarea-row-header',
    templateUrl: './calendar-workarea-row-header.component.html',
    styleUrls: ['./calendar-workarea-row-header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarWorkareaRowHeaderComponent {

    @Input()
    public workarea: CalendarWorkareaRowHeaderModel;
}
