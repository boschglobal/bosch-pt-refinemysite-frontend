/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ProjectTaskActions,
    TaskActionEnum
} from './task.actions';

describe('Project Task Actions', () => {

    it('should check Initialize.All() type', () => {
        expect(new ProjectTaskActions.Initialize.All().type).toBe(TaskActionEnum.InitializeAll);
    });

    it('should check Initialize.Assignment() type', () => {
        expect(new ProjectTaskActions.Initialize.Assignment().type).toBe(TaskActionEnum.InitializeAssignment);
    });

    it('should check Initialize.Sending() type', () => {
        expect(new ProjectTaskActions.Initialize.Sending().type).toBe(TaskActionEnum.InitializeSending);
    });

    it('should check Initialize.Current() type', () => {
        expect(new ProjectTaskActions.Initialize.Current().type).toBe(TaskActionEnum.InitializeCurrent);
    });

    it('should check Initialize.Calendar() type', () => {
        expect(new ProjectTaskActions.Initialize.Calendar().type).toBe(TaskActionEnum.InitializeCalendar);
    });

    it('should check Initialize.CalendarItems() type', () => {
        expect(new ProjectTaskActions.Initialize.CalendarItems().type).toBe(TaskActionEnum.InitializeCalendarItems);
    });

    it('should check Initialize.ListItems() type', () => {
        expect(new ProjectTaskActions.Initialize.ListItems().type).toBe(TaskActionEnum.InitializeListItems);
    });

    it('should check Request.One() type', () => {
        expect(new ProjectTaskActions.Request.One(null).type).toBe(TaskActionEnum.RequestOne);
    });

    it('should check Request.OneFulfilled() type', () => {
        expect(new ProjectTaskActions.Request.OneFulfilled(null).type).toBe(TaskActionEnum.RequestOneFulfilled);
    });

    it('should check Request.OneRejected() type', () => {
        expect(new ProjectTaskActions.Request.OneRejected().type).toBe(TaskActionEnum.RequestOneRejected);
    });

    it('should check Request.OneTaskScheduleByTaskId() type', () => {
        expect(new ProjectTaskActions.Request.OneTaskScheduleByTaskId(null).type).toBe(TaskActionEnum.RequestOneTaskScheduleByTaskId);
    });

    it('should check Request.OneTaskScheduleByTaskIdFulfilled() type', () => {
        expect(new ProjectTaskActions.Request.OneTaskScheduleByTaskIdFulfilled(null).type)
            .toBe(TaskActionEnum.RequestOneTaskScheduleByTaskIdFulfilled);
    });

    it('should check Request.OneTaskScheduleByTaskIdRejected() type', () => {
        expect(new ProjectTaskActions.Request.OneTaskScheduleByTaskIdRejected().type)
            .toBe(TaskActionEnum.RequestOneTaskScheduleByTaskIdRejected);
    });

    it('should check Request.All() type', () => {
        expect(new ProjectTaskActions.Request.All().type).toBe(TaskActionEnum.RequestAll);
    });

    it('should check Request.AllFulfilled() type', () => {
        expect(new ProjectTaskActions.Request.AllFulfilled(null).type).toBe(TaskActionEnum.RequestAllFulfilled);
    });

    it('should check Request.AllRejected() type', () => {
        expect(new ProjectTaskActions.Request.AllRejected().type).toBe(TaskActionEnum.RequestAllRejected);
    });

    it('should check Request.AllCalendar() type', () => {
        expect(new ProjectTaskActions.Request.AllCalendar().type).toBe(TaskActionEnum.RequestAllCalendar);
    });

    it('should check Request.AllCalendarFulfilled() type', () => {
        expect(new ProjectTaskActions.Request.AllCalendarFulfilled(null).type).toBe(TaskActionEnum.RequestAllCalendarFulfilled);
    });

    it('should check Request.AllCalendarRejected() type', () => {
        expect(new ProjectTaskActions.Request.AllCalendarRejected().type).toBe(TaskActionEnum.RequestAllCalendarRejected);
    });

    it('should check Assign.All() type', () => {
        expect(new ProjectTaskActions.Assign.All(null).type).toBe(TaskActionEnum.AssignAll);
    });

    it('should check Assign.AllFulfilled() type', () => {
        expect(new ProjectTaskActions.Assign.AllFulfilled(null).type).toBe(TaskActionEnum.AssignAllFulfilled);
    });

    it('should check Assign.AllRejected() type', () => {
        expect(new ProjectTaskActions.Assign.AllRejected().type).toBe(TaskActionEnum.AssignAllRejected);
    });

    it('should check Send.All() type', () => {
        expect(new ProjectTaskActions.Send.All(null).type).toBe(TaskActionEnum.SendAll);
    });

    it('should check Send.AllFulfilled() type', () => {
        expect(new ProjectTaskActions.Send.AllFulfilled(null).type).toBe(TaskActionEnum.SendAllFulfilled);
    });

    it('should check Send.AllRejected() type', () => {
        expect(new ProjectTaskActions.Send.AllRejected().type).toBe(TaskActionEnum.SendAllRejected);
    });

    it('should check Send.One() type', () => {
        expect(new ProjectTaskActions.Send.One(null).type).toBe(TaskActionEnum.SendOne);
    });

    it('should check Send.OneFulfilled() type', () => {
        expect(new ProjectTaskActions.Send.OneFulfilled(null).type).toBe(TaskActionEnum.SendOneFulfilled);
    });

    it('should check Send.OneRejected() type', () => {
        expect(new ProjectTaskActions.Send.OneRejected().type).toBe(TaskActionEnum.SendOneRejected);
    });

    it('should check Start.All() type', () => {
        expect(new ProjectTaskActions.Start.All(null).type).toBe(TaskActionEnum.StartAll);
    });

    it('should check Start.AllFulfilled() type', () => {
        expect(new ProjectTaskActions.Start.AllFulfilled(null).type).toBe(TaskActionEnum.StartAllFulfilled);
    });

    it('should check Start.AllRejected() type', () => {
        expect(new ProjectTaskActions.Start.AllRejected().type).toBe(TaskActionEnum.StartAllRejected);
    });

    it('should check Start.One() type', () => {
        expect(new ProjectTaskActions.Start.One(null).type).toBe(TaskActionEnum.StartOne);
    });

    it('should check Start.OneFulfilled() type', () => {
        expect(new ProjectTaskActions.Start.OneFulfilled(null).type).toBe(TaskActionEnum.StartOneFulfilled);
    });

    it('should check Start.OneRejected() type', () => {
        expect(new ProjectTaskActions.Start.OneRejected().type).toBe(TaskActionEnum.StartOneRejected);
    });

    it('should check Accept.All() type', () => {
        expect(new ProjectTaskActions.Accept.All(null).type).toBe(TaskActionEnum.AcceptAll);
    });

    it('should check Accept.AllFulfilled() type', () => {
        expect(new ProjectTaskActions.Accept.AllFulfilled(null).type).toBe(TaskActionEnum.AcceptAllFulfilled);
    });

    it('should check Accept.AllRejected() type', () => {
        expect(new ProjectTaskActions.Accept.AllRejected().type).toBe(TaskActionEnum.AcceptAllRejected);
    });

    it('should check Accept.One() type', () => {
        expect(new ProjectTaskActions.Accept.One(null).type).toBe(TaskActionEnum.AcceptOne);
    });

    it('should check Accept.OneFulfilled() type', () => {
        expect(new ProjectTaskActions.Accept.OneFulfilled(null).type).toBe(TaskActionEnum.AcceptOneFulfilled);
    });

    it('should check Accept.OneRejected() type', () => {
        expect(new ProjectTaskActions.Accept.OneRejected().type).toBe(TaskActionEnum.AcceptOneRejected);
    });

    it('should check Close.All() type', () => {
        expect(new ProjectTaskActions.Close.All(null).type).toBe(TaskActionEnum.CloseAll);
    });

    it('should check Close.AllFulfilled() type', () => {
        expect(new ProjectTaskActions.Close.AllFulfilled(null).type).toBe(TaskActionEnum.CloseAllFulfilled);
    });

    it('should check Close.AllRejected() type', () => {
        expect(new ProjectTaskActions.Close.AllRejected().type).toBe(TaskActionEnum.CloseAllRejected);
    });

    it('should check Close.One() type', () => {
        expect(new ProjectTaskActions.Close.One(null).type).toBe(TaskActionEnum.CloseOne);
    });

    it('should check Close.OneFulfilled() type', () => {
        expect(new ProjectTaskActions.Close.OneFulfilled(null).type).toBe(TaskActionEnum.CloseOneFulfilled);
    });

    it('should check Close.OneRejected() type', () => {
        expect(new ProjectTaskActions.Close.OneRejected().type).toBe(TaskActionEnum.CloseOneRejected);
    });

    it('should check Reset.All() type', () => {
        expect(new ProjectTaskActions.Reset.All(null).type).toBe(TaskActionEnum.ResetAll);
    });

    it('should check Reset.AllFulfilled() type', () => {
        expect(new ProjectTaskActions.Reset.AllFulfilled(null).type).toBe(TaskActionEnum.ResetAllFulfilled);
    });

    it('should check Reset.AllRejected() type', () => {
        expect(new ProjectTaskActions.Reset.AllRejected().type).toBe(TaskActionEnum.ResetAllRejected);
    });

    it('should check Reset.One() type', () => {
        expect(new ProjectTaskActions.Reset.One(null).type).toBe(TaskActionEnum.ResetOne);
    });

    it('should check Reset.OneFulfilled() type', () => {
        expect(new ProjectTaskActions.Reset.OneFulfilled(null).type).toBe(TaskActionEnum.ResetOneFulfilled);
    });

    it('should check Reset.OneRejected() type', () => {
        expect(new ProjectTaskActions.Reset.OneRejected().type).toBe(TaskActionEnum.ResetOneRejected);
    });

    it('should check Set.Page() type', () => {
        expect(new ProjectTaskActions.Set.Page(null).type).toBe(TaskActionEnum.SetPage);
    });

    it('should check Set.Items() type', () => {
        expect(new ProjectTaskActions.Set.Items(0).type).toBe(TaskActionEnum.SetItems);
    });

    it('should check Set.Sort() type', () => {
        expect(new ProjectTaskActions.Set.Sort(null).type).toBe(TaskActionEnum.SetSort);
    });

    it('should check Set.Filters() type', () => {
        expect(new ProjectTaskActions.Set.Filters(null).type).toBe(TaskActionEnum.SetFilters);
    });

    it('should check Set.FilterPanelVisibility() type', () => {
        expect(new ProjectTaskActions.Set.FilterPanelVisibility(true).type).toBe(TaskActionEnum.SetFilterPanelVisibility);
    });

    it('should check Set.CalendarPage() type', () => {
        expect(new ProjectTaskActions.Set.CalendarPage(null).type).toBe(TaskActionEnum.SetCalendarPage);
    });

    it('should check Set.CalendarItems() type', () => {
        expect(new ProjectTaskActions.Set.CalendarItems(0).type).toBe(TaskActionEnum.SetCalendarItems);
    });

    it('should check Set.CalendarSort() type', () => {
        expect(new ProjectTaskActions.Set.CalendarSort(null).type).toBe(TaskActionEnum.SetCalendarSort);
    });

    it('should check Set.CalendarFilters() type', () => {
        expect(new ProjectTaskActions.Set.CalendarFilters(null).type).toBe(TaskActionEnum.SetCalendarFilters);
    });

    it('should check Set.CalendarFilterPanelVisibility() type', () => {
        expect(new ProjectTaskActions.Set.CalendarFilterPanelVisibility(true).type).toBe(TaskActionEnum.SetCalendarFilterPanelVisibility);
    });

    it('should check Set.AssignSelecting() type', () => {
        expect(new ProjectTaskActions.Set.AssignSelecting(null).type).toBe(TaskActionEnum.SetAssignSelecting);
    });

    it('should check Set.AssignIds() type', () => {
        expect(new ProjectTaskActions.Set.AssignIds(null).type).toBe(TaskActionEnum.SetAssignIds);
    });

    it('should check Set.SendSelecting() type', () => {
        expect(new ProjectTaskActions.Set.SendSelecting(null).type).toBe(TaskActionEnum.SetSendSelecting);
    });

    it('should check Set.SendIds() type', () => {
        expect(new ProjectTaskActions.Set.SendIds(null).type).toBe(TaskActionEnum.SetSendIds);
    });

    it('should check Update.One() type', () => {
        expect(new ProjectTaskActions.Update.One(null).type).toBe(TaskActionEnum.UpdateOne);
    });

    it('should check Update.OneFulfilled() type', () => {
        expect(new ProjectTaskActions.Update.OneFulfilled(null).type).toBe(TaskActionEnum.UpdateOneFulfilled);
    });

    it('should check Update.OnePartiallyFulfilled() type', () => {
        expect(new ProjectTaskActions.Update.OnePartiallyFulfilled(null).type).toBe(TaskActionEnum.UpdateOnePartiallyFulfilled);
    });

    it('should check Update.OneRejected() type', () => {
        expect(new ProjectTaskActions.Update.OneRejected().type).toBe(TaskActionEnum.UpdateOneRejected);
    });

    it('should check Update.OneReset() type', () => {
        expect(new ProjectTaskActions.Update.OneReset().type).toBe(TaskActionEnum.UpdateOneReset);
    });

    it('should check Delete.One() type', () => {
        expect(new ProjectTaskActions.Delete.One(null).type).toBe(TaskActionEnum.DeleteOne);
    });

    it('should check Delete.OneFulfilled() type', () => {
        expect(new ProjectTaskActions.Delete.OneFulfilled(null).type).toBe(TaskActionEnum.DeleteOneFulfilled);
    });

    it('should check Delete.OneRejected() type', () => {
        expect(new ProjectTaskActions.Delete.OneRejected().type).toBe(TaskActionEnum.DeleteOneRejected);
    });

    it('should check Delete.OneReset() type', () => {
        expect(new ProjectTaskActions.Delete.OneReset().type).toBe(TaskActionEnum.DeleteOneReset);
    });

    it('should check Delete.All() type', () => {
        expect(new ProjectTaskActions.Delete.All(null).type).toBe(TaskActionEnum.DeleteAll);
    });

    it('should check Delete.AllFulfilled() type', () => {
        expect(new ProjectTaskActions.Delete.AllFulfilled(null).type).toBe(TaskActionEnum.DeleteAllFulfilled);
    });

    it('should check Delete.AllRejected() type', () => {
        expect(new ProjectTaskActions.Delete.AllRejected().type).toBe(TaskActionEnum.DeleteAllRejected);
    });

    it('should check Set.Current() type', () => {
        expect(new ProjectTaskActions.Set.Current(null).type).toBe(TaskActionEnum.SetCurrent);
    });

    it('should check Create.One() type', () => {
        expect(new ProjectTaskActions.Create.One(null, 'list').type).toBe(TaskActionEnum.CreateOne);
    });

    it('should check Create.OneFulfilled() type', () => {
        expect(new ProjectTaskActions.Create.OneFulfilled('list').type).toBe(TaskActionEnum.CreateOneFulfilled);
    });

    it('should check Create.OnePartiallyFulfilled() type', () => {
        expect(new ProjectTaskActions.Create.OnePartiallyFulfilled().type).toBe(TaskActionEnum.CreateOnePartiallyFulfilled);
    });

    it('should check Create.OneRejected() type', () => {
        expect(new ProjectTaskActions.Create.OneRejected().type).toBe(TaskActionEnum.CreateOneRejected);
    });

    it('should check Create.OneReset() type', () => {
        expect(new ProjectTaskActions.Create.OneReset().type).toBe(TaskActionEnum.CreateOneReset);
    });

    it('should check Create.All() type', () => {
        expect(new ProjectTaskActions.Create.All(null).type).toBe(TaskActionEnum.CreateAll);
    });

    it('should check Create.AllFulfilled() type', () => {
        expect(new ProjectTaskActions.Create.AllFulfilled(null).type).toBe(TaskActionEnum.CreateAllFulfilled);
    });

    it('should check Create.AllRejected() type', () => {
        expect(new ProjectTaskActions.Create.AllRejected().type).toBe(TaskActionEnum.CreateAllRejected);
    });

    it('should check Create.AllReset() type', () => {
        expect(new ProjectTaskActions.Create.AllReset().type).toBe(TaskActionEnum.CreateAllReset);
    });

    it('should check Copy.All() type', () => {
        expect(new ProjectTaskActions.Copy.All(null).type).toBe(TaskActionEnum.CopyAll);
    });

    it('should check Copy.AllFulfilled() type', () => {
        expect(new ProjectTaskActions.Copy.AllFulfilled(null).type).toBe(TaskActionEnum.CopyAllFulfilled);
    });

    it('should check Copy.AllRejected() type', () => {
        expect(new ProjectTaskActions.Copy.AllRejected().type).toBe(TaskActionEnum.CopyAllRejected);
    });

    it('should check Move.One() type', () => {
        expect(new ProjectTaskActions.Move.One(null).type).toBe(TaskActionEnum.MoveOne);
    });

    it('should check Move.OneFulfilled() type', () => {
        expect(new ProjectTaskActions.Move.OneFulfilled(null).type).toBe(TaskActionEnum.MoveOneFulfilled);
    });

    it('should check Move.OneRejected() type', () => {
        expect(new ProjectTaskActions.Move.OneRejected(null).type).toBe(TaskActionEnum.MoveOneRejected);
    });

    it('should check Move.All() type', () => {
        expect(new ProjectTaskActions.Move.All(null).type).toBe(TaskActionEnum.MoveAll);
    });

    it('should check Move.AllFulfilled() type', () => {
        expect(new ProjectTaskActions.Move.AllFulfilled(null).type).toBe(TaskActionEnum.MoveAllFulfilled);
    });

    it('should check Move.AllRejected() type', () => {
        expect(new ProjectTaskActions.Move.AllRejected(null).type).toBe(TaskActionEnum.MoveAllRejected);
    });

    it('should check Resize.One() type', () => {
        expect(new ProjectTaskActions.Resize.One(null).type).toBe(TaskActionEnum.ResizeOne);
    });

    it('should check Resize.OneFulfilled() type', () => {
        expect(new ProjectTaskActions.Resize.OneFulfilled(null).type).toBe(TaskActionEnum.ResizeOneFulfilled);
    });

    it('should check Resize.OneRejected() type', () => {
        expect(new ProjectTaskActions.Resize.OneRejected(null).type).toBe(TaskActionEnum.ResizeOneRejected);
    });

    it('should check Request.AllByIds() type', () => {
        expect(new ProjectTaskActions.Request.AllByIds(null).type).toBe(TaskActionEnum.RequestAllByIds);
    });

    it('should check Request.AllByIdsFulfilled() type', () => {
        expect(new ProjectTaskActions.Request.AllByIdsFulfilled(null).type).toBe(TaskActionEnum.RequestAllByIdsFulfilled);
    });

    it('should check Request.AllByIdsRejected() type', () => {
        expect(new ProjectTaskActions.Request.AllByIdsRejected().type).toBe(TaskActionEnum.RequestAllByIdsRejected);
    });
});
