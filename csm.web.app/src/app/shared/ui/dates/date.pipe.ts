/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Pipe,
    PipeTransform
} from '@angular/core';
import {Observable} from 'rxjs';

import {
    DateFormatEnum,
    DateHelper,
    DateTimeInstanceEnum,
} from './date.helper.service';

@Pipe({
    name: 'ssDate'
})
export class DatePipe implements PipeTransform {

    constructor(private _dateHelper: DateHelper) {
    }

    public transform(value: string, format: string = DateFormatEnum.Xs, timeInstance: string = DateTimeInstanceEnum.Absolute): Observable<string> {
        return this._dateHelper.observeDate(value, format as DateFormatEnum);
    }

}
