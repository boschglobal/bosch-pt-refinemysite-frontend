/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Moment} from 'moment';

export class SaveTaskScheduleSlotResource {
    public id: string;
    public date: string;

    constructor(id: string, date: Moment) {
        this.id = id;
        this.date = date.format('YYYY-MM-DD');
    }
}
