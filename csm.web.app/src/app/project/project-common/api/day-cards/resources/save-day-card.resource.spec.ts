/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../../shared/rest/constants/date-format.constant';
import {SaveDayCardResource} from './save-day-card.resource';

describe('SaveDayCardResource', () => {
    it(`should instantiate SaveDayCardResource with date formatted as ${API_DATE_YEAR_MONTH_DAY_FORMAT} and oll other properties unchanged`, () => {
        const title = 'foo';
        const date = moment('2020-03-20');
        const manpower = 10;
        const notes = 'bar';
        const saveDayCardResource = new SaveDayCardResource(title, date, manpower, notes);

        expect(saveDayCardResource.title).toBe(title);
        expect(saveDayCardResource.date).toBe(date.format(API_DATE_YEAR_MONTH_DAY_FORMAT));
        expect(saveDayCardResource.manpower).toBe(manpower);
        expect(saveDayCardResource.notes).toBe(notes);
    });
});
