/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    WorkDaysActionEnum,
    WorkDaysActions
} from './work-days.actions';

describe('Work Days Actions', () => {
    it('should check WorkDaysActions.Initialize.All() type', () => {
        expect(new WorkDaysActions.Initialize.All().type).toBe(WorkDaysActionEnum.InitializeAll);
    });

    it('should check WorkDaysActions.Request.One() type', () => {
        expect(new WorkDaysActions.Request.One().type).toBe(WorkDaysActionEnum.RequestOne);
    });

    it('should check WorkDaysActions.Request.OneFulfilled() type', () => {
        expect(new WorkDaysActions.Request.OneFulfilled(null).type).toBe(WorkDaysActionEnum.RequestOneFulfilled);
    });

    it('should check WorkDaysActions.Request.OneRejected() type', () => {
        expect(new WorkDaysActions.Request.OneRejected().type).toBe(WorkDaysActionEnum.RequestOneRejected);
    });
    it('should check WorkDaysActions.Update.One() type', () => {
        expect(new WorkDaysActions.Update.One(null, 0).type).toBe(WorkDaysActionEnum.UpdateOne);
    });
    it('should check WorkDaysActions.Update.OneFulfilled() type', () => {
        expect(new WorkDaysActions.Update.OneFulfilled(null).type).toBe(WorkDaysActionEnum.UpdateOneFulfilled);
    });

    it('should check WorkDaysActions.Update.OneRejected() type', () => {
        expect(new WorkDaysActions.Update.OneRejected().type).toBe(WorkDaysActionEnum.UpdateOneRejected);
    });
});
