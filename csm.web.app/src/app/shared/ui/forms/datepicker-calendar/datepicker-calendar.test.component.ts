/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';
import * as moment from 'moment';

import {
    DatepickerCalendarSelectionTypeEnum,
    DateRange
} from './datepicker-calendar.component';

@Component({
    templateUrl: './datepicker-calendar.test.component.html',
})
export class DatepickerCalendarTestComponent {

    @Input()
    public disabledDates: moment.Moment[] = [];

    @Input()
    public max: moment.Moment;

    @Input()
    public min: moment.Moment;

    @Input()
    public referenceDate: moment.Moment;

    @Input()
    public selectedDate: moment.Moment | DateRange;

    @Input()
    public selectionType: DatepickerCalendarSelectionTypeEnum;

    @Output()
    public selectDate: EventEmitter<moment.Moment> = new EventEmitter<moment.Moment>();
}
