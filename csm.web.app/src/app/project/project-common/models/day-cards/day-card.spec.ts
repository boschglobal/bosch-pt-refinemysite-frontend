/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {MOCK_WORK_DAYS} from '../../../../../test/mocks/workdays';
import {ResourceLink} from '../../../../shared/misc/api/datatypes/resource-link.datatype';
import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {WeekDaysEnum} from '../../../../shared/misc/enums/weekDays.enum';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../shared/rest/constants/date-format.constant';
import {DayCardResource} from '../../api/day-cards/resources/day-card.resource';
import {
    WorkDaysHoliday,
    WorkDaysResource
} from '../../api/work-days/resources/work-days.resource';
import {DayCardStatusEnum} from '../../enums/day-card-status.enum';
import {WorkingDaysHelper} from '../../helpers/working-days.helper';
import {TaskSchedule} from '../task-schedules/task-schedule';
import {DayCard} from './day-card';

describe('Day Card', () => {
    const start = moment().startOf('week').add(1, 'd');
    const end = moment().endOf('week').add(1, 'd');
    const mockedTaskSchedule: TaskSchedule = {
        start: start.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
        end: end.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
    } as TaskSchedule;
    const mockedRange: moment.Moment[] = new Array(end.diff(start, 'd') + 1)
        .fill(start)
        .map((day: moment.Moment, i) => day.clone().add(i, 'd'));
    const workingDaysList = MOCK_WORK_DAYS.workingDays;
    const nonWorkingDays = mockedRange.filter(day => !WorkingDaysHelper.isDayAWorkingDay(day, workingDaysList));

    function fillDayCard<T>(index: number, date: string, target: any): T {
        target.id = `id ${index}`;
        target.version = index;
        target.createdBy = new ResourceReference(`created by id ${index}`, `created by name ${index}`);
        target.createdDate = date;
        target.lastModifiedBy = new ResourceReference(`modified by id ${index}`, `modified by name ${index}`);
        target.lastModifiedDate = date;
        target.title = `title ${index}`;
        target.manpower = 1;
        target.notes = `notes ${index}`;
        target.status = DayCardStatusEnum.NotDone;
        target.reason = 'BAD_WEATHER';
        target.task = new ResourceReference(`taskId ${index}`, `taskName ${index}`);

        return target;
    }

    function createDayCardResource(index: number, hasLinks: boolean, date: string): DayCardResource {
        const dayCardResource = fillDayCard<DayCardResource>(index, date, new DayCardResource());

        dayCardResource._links = {
            self: createLink(),
        };

        if (hasLinks) {
            dayCardResource._links.update = createLink();
            dayCardResource._links.approve = createLink();
            dayCardResource._links.cancel = createLink();
            dayCardResource._links.complete = createLink();
            dayCardResource._links.delete = createLink();
            dayCardResource._links.reset = createLink();
        }

        return dayCardResource;
    }

    function createLink(): ResourceLink {
        const link = new ResourceLink();
        link.href = '';

        return link;
    }

    function createDayCard(index: number, hasPermissions: boolean, date: string): DayCard {
        const dayCard = fillDayCard<DayCard>(index, date, new DayCard());

        dayCard.date = date;
        dayCard.permissions = {
            canDelete: hasPermissions,
            canApprove: hasPermissions,
            canCancel: hasPermissions,
            canComplete: hasPermissions,
            canReset: hasPermissions,
            canUpdate: hasPermissions,
        };

        return dayCard;
    }

    it('should return null if the daycard resource is null', () => {
        expect(DayCard.fromDayCardResource(null, null)).toBe(null);
    });

    it('should return undefined if the daycard resource is undefined', () => {
        expect(DayCard.fromDayCardResource(undefined, null)).toBe(undefined);
    });

    it('should return a daycard with permissions', () => {
        const date = '1989-02-14';
        const dayCardResource = createDayCardResource(1, true, date);
        const expectedDayCard = createDayCard(1, true, date);

        expect(DayCard.fromDayCardResource(dayCardResource, date)).toEqual(expectedDayCard);
    });

    it('should return a daycard without permissions', () => {
        const date = '1989-02-14';
        const dayCardResource = createDayCardResource(1, false, date);
        const expectedDayCard = createDayCard(1, false, date);

        expect(DayCard.fromDayCardResource(dayCardResource, date)).toEqual(expectedDayCard);
    });

    it('should retrieve the correct locked slot dates when there are no day cards and it\'s possible to ' +
        'create day cards on non-working days', () => {
        const newWorkingDays: WorkDaysResource = {...MOCK_WORK_DAYS, allowWorkOnNonWorkingDays: true};

        expect(DayCard.getLockedSlotsDates([], mockedTaskSchedule, newWorkingDays)).toEqual([]);
    });

    it('should retrieve the correct locked slot dates when there are no day cards and it\'s not possible to ' +
        'create day cards on non-working days', () => {
        const newWorkingDays: WorkDaysResource = {...MOCK_WORK_DAYS, allowWorkOnNonWorkingDays: false};
        const results = DayCard.getLockedSlotsDates([], mockedTaskSchedule, newWorkingDays);
        const expectedResults = nonWorkingDays;

        expect(results.length).toEqual(expectedResults.length);
        results.forEach((date, i) => expect(date.isSame(expectedResults[i], 'd')));
    });

    it('should retrieve the correct locked slot dates when there are day cards and it\'s possible to ' +
        'create day cards on non-working days', () => {
        const dayCardDate = start.day(WeekDaysEnum.MONDAY);
        const dayCard: DayCard = createDayCard(0, true, dayCardDate.format(API_DATE_YEAR_MONTH_DAY_FORMAT));
        const newWorkingDays: WorkDaysResource = {...MOCK_WORK_DAYS, allowWorkOnNonWorkingDays: true};
        const results = DayCard.getLockedSlotsDates([dayCard], mockedTaskSchedule, newWorkingDays);
        const expectedResults = [dayCardDate];

        expect(results.length).toEqual(expectedResults.length);
        results.forEach((date, i) => expect(date.isSame(expectedResults[i], 'd')));
    });

    it('should retrieve the correct locked slot dates when there are day cards and it\'s not possible to ' +
        'create day cards on non-working days', () => {
        const dayCardDate = start.day(WeekDaysEnum.MONDAY);
        const dayCard: DayCard = createDayCard(0, true, dayCardDate.format(API_DATE_YEAR_MONTH_DAY_FORMAT));
        const newWorkingDays: WorkDaysResource = {...MOCK_WORK_DAYS, allowWorkOnNonWorkingDays: false};
        const results = DayCard.getLockedSlotsDates([dayCard], mockedTaskSchedule, newWorkingDays);
        const expectedResults = [dayCardDate, ...nonWorkingDays];

        expect(results.length).toEqual(expectedResults.length);
        results.forEach((date, i) => expect(date.isSame(expectedResults[i], 'd')));
    });

    it('should retrieve the correct available slot dates when there are dates excluded', () => {
        const dayCardDate = start.day(WeekDaysEnum.MONDAY);
        const dayCard: DayCard = createDayCard(0, true, dayCardDate.format(API_DATE_YEAR_MONTH_DAY_FORMAT));
        const newWorkingDays: WorkDaysResource = {...MOCK_WORK_DAYS, allowWorkOnNonWorkingDays: false};
        const results = DayCard.getLockedSlotsDates([dayCard], mockedTaskSchedule, newWorkingDays, [dayCardDate]);
        const expectedResults = nonWorkingDays;

        expect(results.length).toEqual(expectedResults.length);
        results.forEach((date, i) => expect(date.isSame(expectedResults[i], 'd')));
    });

    it('should retrieve the correct locked slot dates when there are no day cards and it\'s possible to ' +
        'create day cards on holidays', () => {
        const holidays: WorkDaysHoliday[] = mockedRange.map(day => ({name: 'foo', date: day.format(API_DATE_YEAR_MONTH_DAY_FORMAT)}));
        const newWorkingDays: WorkDaysResource = {...MOCK_WORK_DAYS, holidays, allowWorkOnNonWorkingDays: true};

        expect(DayCard.getLockedSlotsDates([], mockedTaskSchedule, newWorkingDays)).toEqual([]);
    });

    it('should retrieve the correct locked slot dates when there are no day cards and it\'s not possible to ' +
        'create day cards on holidays', () => {
        const holidays: WorkDaysHoliday[] = mockedRange.map(day => ({name: 'foo', date: day.format(API_DATE_YEAR_MONTH_DAY_FORMAT)}));
        const newWorkingDays: WorkDaysResource = {...MOCK_WORK_DAYS, holidays, allowWorkOnNonWorkingDays: false};
        const results = DayCard.getLockedSlotsDates([], mockedTaskSchedule, newWorkingDays);
        const expectedResults = holidays.map(holiday => moment(holiday.date));

        expect(results.length).toEqual(expectedResults.length);
        results.forEach((date, i) => expect(date.isSame(expectedResults[i], 'd')));
    });

    it('should retrieve the correct locked slot dates when there are day cards and it\'s possible to ' +
        'create day cards on holidays', () => {
        const holidays: WorkDaysHoliday[] = mockedRange.map(day => ({name: 'foo', date: day.format(API_DATE_YEAR_MONTH_DAY_FORMAT)}));
        const dayCardDate = start.day(WeekDaysEnum.MONDAY);
        const dayCard: DayCard = createDayCard(0, true, dayCardDate.format(API_DATE_YEAR_MONTH_DAY_FORMAT));
        const newWorkingDays: WorkDaysResource = {...MOCK_WORK_DAYS, holidays, allowWorkOnNonWorkingDays: true};
        const results = DayCard.getLockedSlotsDates([dayCard], mockedTaskSchedule, newWorkingDays);
        const expectedResults = [dayCardDate];

        expect(results.length).toEqual(expectedResults.length);
        results.forEach((date, i) => expect(date.isSame(expectedResults[i], 'd')));
    });

    it('should retrieve the correct locked slot dates when there are day cards and it\'s not possible to ' +
        'create day cards on holidays', () => {
        const dayCardDate = start.day(WeekDaysEnum.MONDAY);
        const holidays: WorkDaysHoliday[] = mockedRange.map(day => ({name: 'foo', date: day.format(API_DATE_YEAR_MONTH_DAY_FORMAT)}));
        const dayCard: DayCard = createDayCard(0, true, dayCardDate.format(API_DATE_YEAR_MONTH_DAY_FORMAT));
        const newWorkingDays: WorkDaysResource = {...MOCK_WORK_DAYS, holidays, allowWorkOnNonWorkingDays: false};
        const results = DayCard.getLockedSlotsDates([dayCard], mockedTaskSchedule, newWorkingDays);
        const expectedResults = holidays.map(holiday => moment(holiday.date));

        expect(results.length).toEqual(expectedResults.length);
        results.forEach((date, i) => expect(date.isSame(expectedResults[i], 'd')));
    });
});
