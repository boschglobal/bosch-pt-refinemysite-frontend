/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    TaskScheduleActionEnum,
    TaskScheduleActions
} from './task-schedule.actions';

describe('Task Schedule Actions', () => {
    it('should check TaskScheduleActions.Initialize.All() type', () => {
        expect(new TaskScheduleActions.Initialize.All().type)
            .toBe(TaskScheduleActionEnum.InitializeAll);
    });
});
