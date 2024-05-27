/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ActivityActionEnum,
    ActivityActions
} from './activity.actions';

describe('Activity Actions', () => {
    it('should check Initialize.All() type', () => {
        expect(new ActivityActions.Initialize.All().type).toBe(ActivityActionEnum.INITIALIZE_ALL_ACTIVITIES);
    });

    it('should check Request.All() type', () => {
        expect(new ActivityActions.Request.All(null).type).toBe(ActivityActionEnum.REQUEST_ALL_ACTIVITIES);
    });

    it('should check Request.AllFulfilled() type', () => {
        expect(new ActivityActions.Request.AllFulfilled(null).type).toBe(ActivityActionEnum.REQUEST_ALL_ACTIVITIES_FULFILLED);
    });

    it('should check Request.AllRejected() type', () => {
        expect(new ActivityActions.Request.AllRejected().type).toBe(ActivityActionEnum.REQUEST_ALL_ACTIVITIES_REJECTED);
    });
});
