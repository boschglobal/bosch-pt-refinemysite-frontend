/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import * as moment from 'moment';

export class TimeScope {
    public start: moment.Moment;
    public end: moment.Moment;

    constructor(start: string, end: string) {
        this.start = moment(start);
        this.end = moment(end);
    }
}
