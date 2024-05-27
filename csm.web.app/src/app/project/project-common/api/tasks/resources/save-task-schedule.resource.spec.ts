/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {MOCK_TASK_SCHEDULE_A} from '../../../../../../test/mocks/task-schedules';
import {TimeScope} from '../../../../../shared/misc/api/datatypes/time-scope.datatype';
import {SaveTaskScheduleResource} from './save-task-schedule.resource';
import {SaveTaskScheduleSlotResource} from './save-task-schedule-slot.resource';

describe('Save Task Schedule Resource', () => {
    const start = '2020-01-01';
    const end = '2020-01-31';

    it('should return new instance of SaveTaskScheduleResource when calling fromTimeScopeAndTaskSchedule()', () => {
        const timeScope: TimeScope = new TimeScope(start, end);
        const schedule = MOCK_TASK_SCHEDULE_A;
        const slots = schedule.slots.map(slot => new SaveTaskScheduleSlotResource(slot.dayCard.id, moment(slot.date)));
        const expectedResult = new SaveTaskScheduleResource(start, end, slots);

        expect(SaveTaskScheduleResource.fromTimeScopeAndTaskSchedule(timeScope, schedule)).toEqual(expectedResult);
    });
});
