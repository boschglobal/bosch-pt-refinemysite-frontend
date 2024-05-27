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

import {
    CalendarDrawingStrategy,
    CalendarMilestone,
    CalendarMilestones,
    CalendarRecordGridUnit,
    CalendarRow,
} from './calendar.component';

@Component({
    templateUrl: './calendar.test.component.html',
})
export class CalendarTestComponent {

    @Input()
    public drawingStrategy: CalendarDrawingStrategy = 'default';

    @Input()
    public hideScroll = false;

    @Input()
    public milestones: CalendarMilestones<CalendarMilestone> = {};

    @Input()
    public recordGridUnit: CalendarRecordGridUnit = 'week';

    @Input()
    public rows: CalendarRow[] = [];
}
