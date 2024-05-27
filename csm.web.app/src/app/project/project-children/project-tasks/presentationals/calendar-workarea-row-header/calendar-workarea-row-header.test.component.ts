/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
} from '@angular/core';

import {CalendarWorkareaRowHeaderModel} from './calendar-workarea-row-header.component';

@Component({
    templateUrl: './calendar-workarea-row-header.test.component.html',
})
export class CalendarWorkareaRowHeaderTestComponent {
    @Input()
    public workarea: CalendarWorkareaRowHeaderModel;
}
