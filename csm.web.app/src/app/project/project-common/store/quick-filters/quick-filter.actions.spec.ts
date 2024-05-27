/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    QuickFilterActionEnum,
    QuickFilterActions,
} from './quick-filter.actions';

describe('Quick Filter Actions', () => {

    it('should check QuickFilterActions.Initialize.All() type', () => {
        expect(new QuickFilterActions.Initialize.All().type)
            .toBe(QuickFilterActionEnum.InitializeAll);
    });

    it('should check QuickFilterActions.Create.One() type', () => {
        expect(new QuickFilterActions.Create.One(null, null).type)
            .toBe(QuickFilterActionEnum.CreateOne);
    });

    it('should check QuickFilterActions.Create.OneFulfilled() type', () => {
        expect(new QuickFilterActions.Create.OneFulfilled(null).type)
            .toBe(QuickFilterActionEnum.CreateOneFulfilled);
    });

    it('should check QuickFilterActions.Create.OneRejected() type', () => {
        expect(new QuickFilterActions.Create.OneRejected().type)
            .toBe(QuickFilterActionEnum.CreateOneRejected);
    });

    it('should check QuickFilterActions.Create.OneReset() type', () => {
        expect(new QuickFilterActions.Create.OneReset().type)
            .toBe(QuickFilterActionEnum.CreateOneReset);
    });

    it('should check QuickFilterActions.Delete.One() type', () => {
        expect(new QuickFilterActions.Delete.One(null, null).type)
            .toBe(QuickFilterActionEnum.DeleteOne);
    });

    it('should check QuickFilterActions.Delete.OneFulfilled() type', () => {
        expect(new QuickFilterActions.Delete.OneFulfilled(null).type)
            .toBe(QuickFilterActionEnum.DeleteOneFulfilled);
    });

    it('should check QuickFilterActions.Delete.OneRejected() type', () => {
        expect(new QuickFilterActions.Delete.OneRejected().type)
            .toBe(QuickFilterActionEnum.DeleteOneRejected);
    });

    it('should check QuickFilterActions.Delete.OneReset() type', () => {
        expect(new QuickFilterActions.Delete.OneReset().type)
            .toBe(QuickFilterActionEnum.DeleteOneReset);
    });

    it('should check QuickFilterActions.Request.All() type', () => {
        expect(new QuickFilterActions.Request.All().type)
            .toBe(QuickFilterActionEnum.RequestAll);
    });

    it('should check QuickFilterActions.Request.AllFulfilled() type', () => {
        expect(new QuickFilterActions.Request.AllFulfilled(null).type)
            .toBe(QuickFilterActionEnum.RequestAllFulfilled);
    });

    it('should check QuickFilterActions.Request.AllRejected() type', () => {
        expect(new QuickFilterActions.Request.AllRejected().type)
            .toBe(QuickFilterActionEnum.RequestAllRejected);
    });

    it('should check QuickFilterActions.Set.AppliedFilter() type', () => {
        expect(new QuickFilterActions.Set.AppliedFilter(null, null).type)
            .toBe(QuickFilterActionEnum.SetAppliedFilter);
    });

    it('should check QuickFilterActions.Update.One() type', () => {
        expect(new QuickFilterActions.Update.One(null, null, null).type)
            .toBe(QuickFilterActionEnum.UpdateOne);
    });

    it('should check QuickFilterActions.Update.OneFulfilled() type', () => {
        expect(new QuickFilterActions.Update.OneFulfilled(null).type)
            .toBe(QuickFilterActionEnum.UpdateOneFulfilled);
    });

    it('should check QuickFilterActions.Update.OneRejected() type', () => {
        expect(new QuickFilterActions.Update.OneRejected().type)
            .toBe(QuickFilterActionEnum.UpdateOneRejected);
    });

    it('should check QuickFilterActions.Update.OneReset() type', () => {
        expect(new QuickFilterActions.Update.OneReset().type)
            .toBe(QuickFilterActionEnum.UpdateOneReset);
    });
});
