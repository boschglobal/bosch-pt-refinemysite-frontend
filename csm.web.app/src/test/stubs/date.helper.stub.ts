/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Observable,
    of
} from 'rxjs';

import {DateFormatEnum} from '../../app/shared/ui/dates/date.helper.service';

export class DateHelperStub {

    public observeDate(date: string, format: DateFormatEnum): Observable<string> {
        return of(date);
    }
}

