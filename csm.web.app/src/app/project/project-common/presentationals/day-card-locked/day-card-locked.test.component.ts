/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    Input
} from '@angular/core';

import {WorkDaysHoliday} from '../../api/work-days/resources/work-days.resource';

@Component({
    template: `
        <ss-day-card-locked [holiday]="holiday">
        </ss-day-card-locked>
    `,
})

export class DayCardLockedTestComponent {

    @Input()
    public holiday: WorkDaysHoliday;
}
