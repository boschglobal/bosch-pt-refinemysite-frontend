/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    TaskConstraintsActionEnum,
    TaskConstraintsActions
} from './task-constraints.actions';

describe('Task Constraints Actions', () => {
    it('should check TaskConstraintsActions.Initialize.All()', () => {
        expect(new TaskConstraintsActions.Initialize.All().type)
            .toBe(TaskConstraintsActionEnum.InitializeAll);
    });

    it('should check TaskConstraintsActions.Request.One()', () => {
        expect(new TaskConstraintsActions.Request.One(null).type)
            .toBe(TaskConstraintsActionEnum.RequestOne);
    });

    it('should check TaskConstraintsActions.Request.OneFulfilled()', () => {
        expect(new TaskConstraintsActions.Request.OneFulfilled(null, null).type)
            .toBe(TaskConstraintsActionEnum.RequestOneFulfilled);
    });

    it('should check TaskConstraintsActions.Request.OneRejected()', () => {
        expect(new TaskConstraintsActions.Request.OneRejected(null).type)
            .toBe(TaskConstraintsActionEnum.RequestOneRejected);
    });

    it('should check TaskConstraintsActions.Update.One()', () => {
        expect(new TaskConstraintsActions.Update.One(null, null).type)
            .toBe(TaskConstraintsActionEnum.UpdateOne);
    });

    it('should check TaskConstraintsActions.Update.OneFulfilled()', () => {
        expect(new TaskConstraintsActions.Update.OneFulfilled(null, null).type)
            .toBe(TaskConstraintsActionEnum.UpdateOneFulfilled);
    });

    it('should check TaskConstraintsActions.Update.OneRejected()', () => {
        expect(new TaskConstraintsActions.Update.OneRejected(null).type)
            .toBe(TaskConstraintsActionEnum.UpdateOneRejected);
    });

    it('should check TaskConstraintsActions.Update.OneReset()', () => {
        expect(new TaskConstraintsActions.Update.OneReset(null).type)
            .toBe(TaskConstraintsActionEnum.UpdateOneReset);
    });
});
