/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../shared/rest/constants/date-format.constant';
import {WEEK_DAYS_MOMENT_SORTED} from '../../../shared/ui/dates/date.helper.service';
import {WorkDaysHoliday} from '../api/work-days/resources/work-days.resource';
import {WorkingDaysHelper} from './working-days.helper';

describe('Working Days Helper', () => {
    const today = moment();

    it('should return true when day is a working day', () => {
        const workingDays = [WEEK_DAYS_MOMENT_SORTED[today.day()]];

        expect(WorkingDaysHelper.isDayAWorkingDay(today, workingDays)).toBe(true);
    });

    it('should return false when day is not a working day', () => {
        expect(WorkingDaysHelper.isDayAWorkingDay(today, [])).toBe(false);
    });

    it('should return true when day is a holiday', () => {
        const holidays: WorkDaysHoliday[] = [{name: 'foo', date: today.format(API_DATE_YEAR_MONTH_DAY_FORMAT)}];

        expect(WorkingDaysHelper.isDayAHoliday(today, holidays)).toBe(true);
    });

    it('should return false when day is not a holiday', () => {
        expect(WorkingDaysHelper.isDayAHoliday(today, [])).toBe(false);
    });

    it('should return holiday when day is in the list', () => {
        const holiday: WorkDaysHoliday = {name: 'foo', date: today.format(API_DATE_YEAR_MONTH_DAY_FORMAT)};
        const holidays: WorkDaysHoliday[] = [holiday];

        expect(WorkingDaysHelper.getHoliday(today, holidays)).toBe(holiday);
    });

    it('should not return holiday when day is not in the list', () => {
        const holidays: WorkDaysHoliday[] = [];

        expect(WorkingDaysHelper.getHoliday(today, holidays)).toBe(undefined);
    });
});
