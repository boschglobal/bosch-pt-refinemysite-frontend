/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../../shared/rest/constants/date-format.constant';

export class SaveDayCardResource {
    public title: string;
    public date: string;
    public manpower: number;
    public notes?: string;

    constructor(title: string,
                date: moment.Moment,
                manpower: number,
                notes: string) {
        this.title = title;
        this.date = date.format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        this.manpower = manpower;
        this.notes = notes;
    }
}
