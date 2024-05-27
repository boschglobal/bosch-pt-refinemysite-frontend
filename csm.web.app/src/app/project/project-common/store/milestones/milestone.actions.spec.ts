/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    MilestoneActionEnum,
    MilestoneActions
} from './milestone.actions';

describe('Milestone Actions', () => {
    it('should check MilestoneActions.Initialize.All() type', () => {
        expect(new MilestoneActions.Initialize.All().type)
            .toBe(MilestoneActionEnum.InitializeAll);
    });

    it('should check MilestoneActions.Initialize.List() type', () => {
        expect(new MilestoneActions.Initialize.List().type)
            .toBe(MilestoneActionEnum.InitializeList);
    });

    it('should check MilestoneActions.Request.One() type', () => {
        expect(new MilestoneActions.Request.One(null).type)
            .toBe(MilestoneActionEnum.RequestOne);
    });

    it('should check MilestoneActions.Request.OneFulfilled() type', () => {
        expect(new MilestoneActions.Request.OneFulfilled(null).type)
            .toBe(MilestoneActionEnum.RequestOneFulfilled);
    });

    it('should check MilestoneActions.Request.OneRejected() type', () => {
        expect(new MilestoneActions.Request.OneRejected().type)
            .toBe(MilestoneActionEnum.RequestOneRejected);
    });

    it('should check MilestoneActions.Request.All() type', () => {
        expect(new MilestoneActions.Request.All().type)
            .toBe(MilestoneActionEnum.RequestAll);
    });

    it('should check MilestoneActions.Request.AllFulfilled() type', () => {
        expect(new MilestoneActions.Request.AllFulfilled(null).type)
            .toBe(MilestoneActionEnum.RequestAllFulfilled);
    });

    it('should check MilestoneActions.Request.AllRejected() type', () => {
        expect(new MilestoneActions.Request.AllRejected().type)
            .toBe(MilestoneActionEnum.RequestAllRejected);
    });

    it('should check MilestoneActions.Create.One() type', () => {
        expect(new MilestoneActions.Create.One(null).type)
            .toBe(MilestoneActionEnum.CreateOne);
    });

    it('should check MilestoneActions.Create.OneFulfilled() type', () => {
        expect(new MilestoneActions.Create.OneFulfilled(null).type)
            .toBe(MilestoneActionEnum.CreateOneFulfilled);
    });

    it('should check MilestoneActions.Create.OneRejected() type', () => {
        expect(new MilestoneActions.Create.OneRejected().type)
            .toBe(MilestoneActionEnum.CreateOneRejected);
    });

    it('should check MilestoneActions.Create.OneReset() type', () => {
        expect(new MilestoneActions.Create.OneReset().type)
            .toBe(MilestoneActionEnum.CreateOneReset);
    });

    it('should check MilestoneActions.Delete.One() type', () => {
        expect(new MilestoneActions.Delete.One(null, null).type)
            .toBe(MilestoneActionEnum.DeleteOne);
    });

    it('should check MilestoneActions.Delete.OneFulfilled() type', () => {
        expect(new MilestoneActions.Delete.OneFulfilled(null).type)
            .toBe(MilestoneActionEnum.DeleteOneFulfilled);
    });

    it('should check MilestoneActions.Delete.OneRejected() type', () => {
        expect(new MilestoneActions.Delete.OneRejected().type)
            .toBe(MilestoneActionEnum.DeleteOneRejected);
    });

    it('should check MilestoneActions.Delete.OneReset() type', () => {
        expect(new MilestoneActions.Delete.OneReset().type)
            .toBe(MilestoneActionEnum.DeleteOneReset);
    });

    it('should check MilestoneActions.Update.One() type', () => {
        expect(new MilestoneActions.Update.One(null, null, null).type)
            .toBe(MilestoneActionEnum.UpdateOne);
    });

    it('should check MilestoneActions.Update.OneFulfilled() type', () => {
        expect(new MilestoneActions.Update.OneFulfilled(null).type)
            .toBe(MilestoneActionEnum.UpdateOneFulfilled);
    });

    it('should check MilestoneActions.Update.OneRejected() type', () => {
        expect(new MilestoneActions.Update.OneRejected().type)
            .toBe(MilestoneActionEnum.UpdateOneRejected);
    });

    it('should check MilestoneActions.Update.OneReset() type', () => {
        expect(new MilestoneActions.Update.OneReset().type)
            .toBe(MilestoneActionEnum.UpdateOneReset);
    });

    it('should check MilestoneActions.Request.AllByIds() type', () => {
        expect(new MilestoneActions.Request.AllByIds(null).type)
            .toBe(MilestoneActionEnum.RequestAllByIds);
    });

    it('should check MilestoneActions.Request.AllByIdsFulfilled() type', () => {
        expect(new MilestoneActions.Request.AllByIdsFulfilled(null).type)
            .toBe(MilestoneActionEnum.RequestAllByIdsFulfilled);
    });

    it('should check MilestoneActions.Request.AllByIdsRejected() type', () => {
        expect(new MilestoneActions.Request.AllByIdsRejected().type)
            .toBe(MilestoneActionEnum.RequestAllByIdsRejected);
    });

    it('should check MilestoneActions.Request.AllByMilestoneListIds() type', () => {
        expect(new MilestoneActions.Request.AllByMilestoneListIds(null).type)
            .toBe(MilestoneActionEnum.RequestAllByMilestoneListIds);
    });

    it('should check MilestoneActions.Request.AllByMilestoneListIdsFulfilled() type', () => {
        expect(new MilestoneActions.Request.AllByMilestoneListIdsFulfilled(null).type)
            .toBe(MilestoneActionEnum.RequestAllByMilestoneListIdsFulfilled);
    });

    it('should check MilestoneActions.Request.AllByMilestoneListIdsRejected() type', () => {
        expect(new MilestoneActions.Request.AllByMilestoneListIdsRejected().type)
            .toBe(MilestoneActionEnum.RequestAllByMilestoneListIdsRejected);
    });

    it('should check MilestoneActions.Set.Filters() type', () => {
        expect(new MilestoneActions.Set.Filters(null).type)
            .toBe(MilestoneActionEnum.SetFilters);
    });
});
