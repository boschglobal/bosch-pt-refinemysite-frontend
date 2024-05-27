/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    DayCardActionEnum,
    DayCardActions
} from './day-card.actions';

describe('Day Card Actions', () => {
    it('should check DayCardActions.Initialize.All() type', () => {
        expect(new DayCardActions.Initialize.All().type)
            .toBe(DayCardActionEnum.InitializeAllDayCards);
    });

    it('should check DayCardActions.Request.One() type', () => {
        expect(new DayCardActions.Request.One(null).type)
            .toBe(DayCardActionEnum.RequestOneDayCard);
    });

    it('should check DayCardActions.Request.OneFulfilled() type', () => {
        expect(new DayCardActions.Request.OneFulfilled(null).type)
            .toBe(DayCardActionEnum.RequestOneDayCardFulfilled);
    });

    it('should check DayCardActions.Request.OneRejected() type', () => {
        expect(new DayCardActions.Request.OneRejected().type)
            .toBe(DayCardActionEnum.RequestOneDayCardRejected);
    });

    it('should check DayCardActions.Request.AllByTask() type', () => {
        expect(new DayCardActions.Request.AllByTask(null).type)
            .toBe(DayCardActionEnum.RequestAllDayCardsByTask);
    });

    it('should check DayCardActions.Request.AllByTaskFulfilled() type', () => {
        expect(new DayCardActions.Request.AllByTaskFulfilled(null).type)
            .toBe(DayCardActionEnum.RequestAllDayCardsByTaskFulfilled);
    });

    it('should check DayCardActions.Request.AllByTaskRejected() type', () => {
        expect(new DayCardActions.Request.AllByTaskRejected(null).type)
            .toBe(DayCardActionEnum.RequestAllDayCardsByTaskRejected);
    });

    it('should check DayCardActions.Request.AllFromTasks() type', () => {
        expect(new DayCardActions.Request.AllFromTasks(null).type)
            .toBe(DayCardActionEnum.RequestAllDayCardsFromTasks);
    });

    it('should check DayCardActions.Request.AllFromTasksFulfilled() type', () => {
        expect(new DayCardActions.Request.AllFromTasksFulfilled(null).type)
            .toBe(DayCardActionEnum.RequestAllDayCardsFromTasksFulfilled);
    });

    it('should check DayCardActions.Request.AllFromTasksRejected() type', () => {
        expect(new DayCardActions.Request.AllFromTasksRejected(null).type)
            .toBe(DayCardActionEnum.RequestAllDayCardsFromTasksRejected);
    });

    it('should check DayCardActions.Request.All() type', () => {
        expect(new DayCardActions.Request.All(null).type)
            .toBe(DayCardActionEnum.RequestAllDayCard);
    });

    it('should check DayCardActions.Request.AllFulfilled() type', () => {
        expect(new DayCardActions.Request.AllFulfilled(null).type)
            .toBe(DayCardActionEnum.RequestAllDayCardFulfilled);
    });

    it('should check DayCardActions.Request.AllRejected() type', () => {
        expect(new DayCardActions.Request.AllRejected().type)
            .toBe(DayCardActionEnum.RequestAllDayCardRejected);
    });

    it('should check DayCardActions.Request.AllReset() type', () => {
        expect(new DayCardActions.Request.AllReset().type)
            .toBe(DayCardActionEnum.RequestAllDayCardReset);
    });

    it('should check DayCardActions.Create.One() type', () => {
        expect(new DayCardActions.Create.One(null).type)
            .toBe(DayCardActionEnum.CreateOneDayCard);
    });

    it('should check DayCardActions.Create.OneFulfilled() type', () => {
        expect(new DayCardActions.Create.OneFulfilled(null).type)
            .toBe(DayCardActionEnum.CreateOneDayCardFulfilled);
    });

    it('should check DayCardActions.Create.OneRejected() type', () => {
        expect(new DayCardActions.Create.OneRejected(null).type)
            .toBe(DayCardActionEnum.CreateOneDayCardRejected);
    });

    it('should check DayCardActions.Create.OneReset() type', () => {
        expect(new DayCardActions.Create.OneReset().type)
            .toBe(DayCardActionEnum.CreateOneDayCardReset);
    });

    it('should check DayCardActions.Delete.One() type', () => {
        expect(new DayCardActions.Delete.One(null).type)
            .toBe(DayCardActionEnum.DeleteOneDayCard);
    });

    it('should check DayCardActions.Delete.OneFulfilled() type', () => {
        expect(new DayCardActions.Delete.OneFulfilled(null).type)
            .toBe(DayCardActionEnum.DeleteOneDayCardFulfilled);
    });

    it('should check DayCardActions.Delete.OneRejected() type', () => {
        expect(new DayCardActions.Delete.OneRejected().type)
            .toBe(DayCardActionEnum.DeleteOneDayCardRejected);
    });

    it('should check DayCardActions.Delete.OneReset() type', () => {
        expect(new DayCardActions.Delete.OneReset().type)
            .toBe(DayCardActionEnum.DeleteOneDayCardReset);
    });

    it('should check DayCardActions.Delete.All() type', () => {
        expect(new DayCardActions.Delete.All(null).type)
            .toBe(DayCardActionEnum.DeleteAllDayCard);
    });

    it('should check DayCardActions.Delete.AllFulfilled() type', () => {
        expect(new DayCardActions.Delete.AllFulfilled(null).type)
            .toBe(DayCardActionEnum.DeleteAllDayCardFulfilled);
    });

    it('should check DayCardActions.Delete.AllRejected() type', () => {
        expect(new DayCardActions.Delete.AllRejected().type)
            .toBe(DayCardActionEnum.DeleteAllDayCardRejected);
    });

    it('should check DayCardActions.Delete.AllReset() type', () => {
        expect(new DayCardActions.Delete.AllReset().type)
            .toBe(DayCardActionEnum.DeleteAllDayCardReset);
    });

    it('should check DayCardActions.Update.One() type', () => {
        expect(new DayCardActions.Update.One(null).type)
            .toBe(DayCardActionEnum.UpdateOneDayCard);
    });

    it('should check DayCardActions.Update.OneFulfilled() type', () => {
        expect(new DayCardActions.Update.OneFulfilled(null).type)
            .toBe(DayCardActionEnum.UpdateOneDayCardFulfilled);
    });

    it('should check DayCardActions.Update.OneWithScheduleFulfilled() type', () => {
        expect(new DayCardActions.Update.OneWithScheduleFulfilled(null).type)
            .toBe(DayCardActionEnum.UpdateOneDayCardWithScheduleFulfilled);
    });

    it('should check DayCardActions.Update.OnePartiallyFulfilled() type', () => {
        expect(new DayCardActions.Update.OnePartiallyFulfilled(null).type)
            .toBe(DayCardActionEnum.UpdateOneDayCardPartiallyFulfilled);
    });

    it('should check DayCardActions.Update.OneRejected() type', () => {
        expect(new DayCardActions.Update.OneRejected().type)
            .toBe(DayCardActionEnum.UpdateOneDayCardRejected);
    });

    it('should check DayCardActions.Update.OneReset() type', () => {
        expect(new DayCardActions.Update.OneReset().type)
            .toBe(DayCardActionEnum.UpdateOneDayCardReset);
    });

    it('should check DayCardActions.Update.Slots() type', () => {
        expect(new DayCardActions.Update.Slots(null).type)
            .toBe(DayCardActionEnum.UpdateSlots);
    });

    it('should check DayCardActions.Update.SlotsFulfilled() type', () => {
        expect(new DayCardActions.Update.SlotsFulfilled(null).type)
            .toBe(DayCardActionEnum.UpdateSlotsFulfilled);
    });

    it('should check DayCardActions.Update.SlotsRejected() type', () => {
        expect(new DayCardActions.Update.SlotsRejected(null).type)
            .toBe(DayCardActionEnum.UpdateSlotsRejected);
    });

    it('should check DayCardActions.Approve.One() type', () => {
        expect(new DayCardActions.Approve.One(null).type)
            .toBe(DayCardActionEnum.ApproveOneDayCard);
    });

    it('should check DayCardActions.Approve.OneFulfilled() type', () => {
        expect(new DayCardActions.Approve.OneFulfilled(null).type)
            .toBe(DayCardActionEnum.ApproveOneDayCardFulfilled);
    });

    it('should check DayCardActions.Approve.OneRejected() type', () => {
        expect(new DayCardActions.Approve.OneRejected().type)
            .toBe(DayCardActionEnum.ApproveOneDayCardRejected);
    });

    it('should check DayCardActions.Approve.OneReset() type', () => {
        expect(new DayCardActions.Approve.OneReset().type)
            .toBe(DayCardActionEnum.ApproveOneDayCardReset);
    });

    it('should check DayCardActions.Approve.All() type', () => {
        expect(new DayCardActions.Approve.All(null).type)
            .toBe(DayCardActionEnum.ApproveAllDayCard);
    });

    it('should check DayCardActions.Approve.AllFulfilled() type', () => {
        expect(new DayCardActions.Approve.AllFulfilled(null).type)
            .toBe(DayCardActionEnum.ApproveAllDayCardFulfilled);
    });

    it('should check DayCardActions.Approve.AllRejected() type', () => {
        expect(new DayCardActions.Approve.AllRejected([]).type)
            .toBe(DayCardActionEnum.ApproveAllDayCardRejected);
    });

    it('should check DayCardActions.Approve.AllReset() type', () => {
        expect(new DayCardActions.Approve.AllReset().type)
            .toBe(DayCardActionEnum.ApproveAllDayCardReset);
    });

    it('should check DayCardActions.Cancel.One() type', () => {
        expect(new DayCardActions.Cancel.One(null).type)
            .toBe(DayCardActionEnum.CancelOneDayCard);
    });

    it('should check DayCardActions.Cancel.OneFulfilled() type', () => {
        expect(new DayCardActions.Cancel.OneFulfilled(null).type)
            .toBe(DayCardActionEnum.CancelOneDayCardFulfilled);
    });

    it('should check DayCardActions.Cancel.OneRejected() type', () => {
        expect(new DayCardActions.Cancel.OneRejected().type)
            .toBe(DayCardActionEnum.CancelOneDayCardRejected);
    });

    it('should check DayCardActions.Cancel.OneReset() type', () => {
        expect(new DayCardActions.Cancel.OneReset().type)
            .toBe(DayCardActionEnum.CancelOneDayCardReset);
    });

    it('should check DayCardActions.Cancel.All() type', () => {
        expect(new DayCardActions.Cancel.All(null).type)
            .toBe(DayCardActionEnum.CancelAllDayCard);
    });

    it('should check DayCardActions.Cancel.AllFulfilled() type', () => {
        expect(new DayCardActions.Cancel.AllFulfilled(null).type)
            .toBe(DayCardActionEnum.CancelAllDayCardFulfilled);
    });

    it('should check DayCardActions.Cancel.AllRejected() type', () => {
        expect(new DayCardActions.Cancel.AllRejected().type)
            .toBe(DayCardActionEnum.CancelAllDayCardRejected);
    });

    it('should check DayCardActions.Cancel.AllReset() type', () => {
        expect(new DayCardActions.Cancel.AllReset().type)
            .toBe(DayCardActionEnum.CancelAllDayCardReset);
    });

    it('should check DayCardActions.Complete.One() type', () => {
        expect(new DayCardActions.Complete.One(null).type)
            .toBe(DayCardActionEnum.CompleteOneDayCard);
    });

    it('should check DayCardActions.Complete.OneFulfilled() type', () => {
        expect(new DayCardActions.Complete.OneFulfilled(null).type)
            .toBe(DayCardActionEnum.CompleteOneDayCardFulfilled);
    });

    it('should check DayCardActions.Complete.OneRejected() type', () => {
        expect(new DayCardActions.Complete.OneRejected().type)
            .toBe(DayCardActionEnum.CompleteOneDayCardRejected);
    });

    it('should check DayCardActions.Complete.OneReset() type', () => {
        expect(new DayCardActions.Complete.OneReset().type)
            .toBe(DayCardActionEnum.CompleteOneDayCardReset);
    });

    it('should check DayCardActions.Complete.All() type', () => {
        expect(new DayCardActions.Complete.All(null).type)
            .toBe(DayCardActionEnum.CompleteAllDayCard);
    });

    it('should check DayCardActions.Complete.AllFulfilled() type', () => {
        expect(new DayCardActions.Complete.AllFulfilled(null).type)
            .toBe(DayCardActionEnum.CompleteAllDayCardFulfilled);
    });

    it('should check DayCardActions.Complete.AllRejected() type', () => {
        expect(new DayCardActions.Complete.AllRejected().type)
            .toBe(DayCardActionEnum.CompleteAllDayCardRejected);
    });

    it('should check DayCardActions.Complete.AllReset() type', () => {
        expect(new DayCardActions.Complete.AllReset().type)
            .toBe(DayCardActionEnum.CompleteAllDayCardReset);
    });

    it('should check DayCardActions.Reset.One() type', () => {
        expect(new DayCardActions.Reset.One(null).type)
            .toBe(DayCardActionEnum.ResetOneDayCard);
    });

    it('should check DayCardActions.Reset.OneFulfilled() type', () => {
        expect(new DayCardActions.Reset.OneFulfilled(null).type)
            .toBe(DayCardActionEnum.ResetOneDayCardFulfilled);
    });

    it('should check DayCardActions.Reset.OneRejected() type', () => {
        expect(new DayCardActions.Reset.OneRejected().type)
            .toBe(DayCardActionEnum.ResetOneDayCardRejected);
    });

    it('should check DayCardActions.Reset.OneReset() type', () => {
        expect(new DayCardActions.Reset.OneReset().type)
            .toBe(DayCardActionEnum.ResetOneDayCardReset);
    });
});
