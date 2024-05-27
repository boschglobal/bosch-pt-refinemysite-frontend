/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */
import * as moment from 'moment';

import {MOCK_TASK_SCHEDULE_A} from '../../../../../../test/mocks/task-schedules';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../../shared/rest/constants/date-format.constant';
import {SaveTaskScheduleSlotResource} from '../../tasks/resources/save-task-schedule-slot.resource';
import {SaveTaskScheduleListItemResource} from './save-task-schedule-list-item.resource';

describe('Save Task Schedule List Item', () => {

    const schedule = MOCK_TASK_SCHEDULE_A;

    it('should create a instance of SaveTaskScheduleListItemResource with default empty slots', () => {
        const {task: {id}, version} = MOCK_TASK_SCHEDULE_A;
        const start = moment(MOCK_TASK_SCHEDULE_A.start).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const end = moment(MOCK_TASK_SCHEDULE_A.end).format(API_DATE_YEAR_MONTH_DAY_FORMAT);

        const resource = new SaveTaskScheduleListItemResource(id, version, start, end);

        expect(resource.slots).toEqual([]);
    });

    it('should create a instance of SaveTaskScheduleListItemResource with custom slots', () => {
        const {task: {id}, version} = MOCK_TASK_SCHEDULE_A;
        const start = moment(MOCK_TASK_SCHEDULE_A.start).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const end = moment(MOCK_TASK_SCHEDULE_A.end).format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        const slots = schedule.slots.map(slot => new SaveTaskScheduleSlotResource(slot.dayCard.id, moment(slot.date)));

        const resource = new SaveTaskScheduleListItemResource(id, version, start, end, slots);

        expect(resource.slots).toEqual(slots);
    });
});
