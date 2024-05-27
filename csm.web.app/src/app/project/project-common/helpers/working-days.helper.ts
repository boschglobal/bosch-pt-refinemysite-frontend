/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {WeekDaysEnum} from '../../../shared/misc/enums/weekDays.enum';
import {DateHelper} from '../../../shared/ui/dates/date.helper.service';
import {WorkDaysHoliday} from '../api/work-days/resources/work-days.resource';

export class WorkingDaysHelper {
    public static isDayAWorkingDay(day: moment.Moment, workingDays: WeekDaysEnum[]): boolean {
        return workingDays
            .map(workingDay => DateHelper.getWeekDayMomentNumber(workingDay))
            .includes(day.day());
    }

    public static isDayAHoliday(day: moment.Moment, holidays: WorkDaysHoliday[]): boolean {
        return holidays
            .map(holiday => moment(holiday.date))
            .some((holiday: moment.Moment) => holiday.isSame(day, 'd'));
    }

    public static getHoliday(day: moment.Moment, holidays: WorkDaysHoliday[]): WorkDaysHoliday | undefined {
        return holidays.find(holiday => moment(holiday.date).isSame(day, 'd'));
    }
}
