/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';
import {Moment} from 'moment';

import {DayCardResource} from '../../api/day-cards/resources/day-card.resource';
import {SaveDayCardResource} from '../../api/day-cards/resources/save-day-card.resource';
import {RfvKey} from '../../api/rfvs/resources/rfv.resource';
import {TaskScheduleResource} from '../../api/tasks/resources/task-schedule.resource';

export enum DayCardActionEnum {
    InitializeAllDayCards = '[Day Card] Initialize all',
    CreateOneDayCard = '[Day Card] Create one',
    CreateOneDayCardFulfilled = '[Day Card] Create one fulfilled',
    CreateOneDayCardRejected = '[Day Card] Create one rejected',
    CreateOneDayCardReset = '[Day Card] Create one reset',
    DeleteOneDayCard = '[Day Card] Delete one',
    DeleteOneDayCardFulfilled = '[Day Card] Delete one fulfilled',
    DeleteOneDayCardRejected = '[Day Card] Delete one rejected',
    DeleteOneDayCardReset = '[Day Card] Delete one reset',
    DeleteAllDayCard = '[Day Card] Delete all',
    DeleteAllDayCardFulfilled = '[Day Card] Delete all fulfilled',
    DeleteAllDayCardRejected = '[Day Card] Delete all rejected',
    DeleteAllDayCardReset = '[Day Card] Delete all reset',
    ApproveOneDayCard = '[Day Card] Approve one',
    ApproveOneDayCardFulfilled = '[Day Card] Approve one fulfilled',
    ApproveOneDayCardRejected = '[Day Card] Approve one rejected',
    ApproveAllDayCard = '[Day Card] Approve all',
    ApproveAllDayCardFulfilled = '[Day Card] Approve all fulfilled',
    ApproveAllDayCardRejected = '[Day Card] Approve all rejected',
    ApproveAllDayCardReset = '[Day Card] Approve all reset',
    ApproveOneDayCardReset = '[Day Card] Approve one reset',
    CompleteOneDayCard = '[Day Card] Complete one',
    CompleteOneDayCardFulfilled = '[Day Card] Complete one fulfilled',
    CompleteOneDayCardRejected = '[Day Card] Complete one rejected',
    CompleteAllDayCard = '[Day Card] Complete all',
    CompleteAllDayCardFulfilled = '[Day Card] Complete all fulfilled',
    CompleteAllDayCardRejected = '[Day Card] Complete all rejected',
    CompleteAllDayCardReset = '[Day Card] Complete all reset',
    CompleteOneDayCardReset = '[Day Card] Complete one reset',
    CancelOneDayCard = '[Day Card] Cancel one',
    CancelOneDayCardFulfilled = '[Day Card] Cancel one fulfilled',
    CancelOneDayCardRejected = '[Day Card] Cancel one rejected',
    CancelOneDayCardReset = '[Day Card] Cancel one reset',
    CancelAllDayCard = '[Day Card] Cancel all',
    CancelAllDayCardFulfilled = '[Day Card] Cancel all fulfilled',
    CancelAllDayCardRejected = '[Day Card] Cancel all rejected',
    CancelAllDayCardReset = '[Day Card] Cancel all reset',
    ResetOneDayCard = '[Day Card] Reset one',
    ResetOneDayCardFulfilled = '[Day Card] Reset one fulfilled',
    ResetOneDayCardRejected = '[Day Card] Reset one rejected',
    ResetOneDayCardReset = '[Day Card] Reset one reset',
    UpdateOneDayCard = '[Day Card] Update one',
    UpdateOneDayCardFulfilled = '[Day Card] Update one fulfilled',
    UpdateOneDayCardWithScheduleFulfilled = '[Day Card] Update one with schedule fulfilled',
    UpdateOneDayCardPartiallyFulfilled = '[Day Card] Update one partially fulfilled',
    UpdateOneDayCardRejected = '[Day Card] Update one rejected',
    UpdateOneDayCardReset = '[Day Card] Update one reset',
    UpdateSlots = '[Day Card] Update slots',
    UpdateSlotsFulfilled = '[Day Card] Update slots fulfilled',
    UpdateSlotsRejected = '[Day Card] Update slots rejected',
    RequestOneDayCard = '[Day Card] Request one',
    RequestOneDayCardFulfilled = '[Day Card] Request one fulfilled',
    RequestOneDayCardRejected = '[Day Card] Request one rejected',
    RequestAllDayCard = '[Day Card] Request all',
    RequestAllDayCardFulfilled = '[Day Card] Request all fulfilled',
    RequestAllDayCardRejected = '[Day Card] Request all rejected',
    RequestAllDayCardReset = '[Day Card] Request all reset',
    RequestAllDayCardsByTask = '[Day Card] Request all by task',
    RequestAllDayCardsByTaskFulfilled = '[Day Card] Request all by task fulfilled',
    RequestAllDayCardsByTaskRejected = '[Day Card] Request all by task rejected',
    RequestAllDayCardsFromTasks = '[Day Card] Request all from tasks',
    RequestAllDayCardsFromTasksFulfilled = '[Day Card] Request all from tasks fulfilled',
    RequestAllDayCardsFromTasksRejected = '[Day Card] Request all from tasks rejected',
}

export namespace DayCardActions {

    export namespace Initialize {
        export class All implements Action {
            public readonly type = DayCardActionEnum.InitializeAllDayCards;

            constructor() {
            }
        }
    }

    export namespace Request {
        export class One implements Action {
            public readonly type = DayCardActionEnum.RequestOneDayCard;

            constructor(public payload: string) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = DayCardActionEnum.RequestOneDayCardFulfilled;

            constructor(public payload: DayCardResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = DayCardActionEnum.RequestOneDayCardRejected;

            constructor() {
            }
        }

        export class AllByTask implements Action {
            public readonly type = DayCardActionEnum.RequestAllDayCardsByTask;

            constructor(public payload: string) {
            }
        }

        export class AllByTaskFulfilled implements Action {
            public readonly type = DayCardActionEnum.RequestAllDayCardsByTaskFulfilled;

            constructor(public payload: TaskScheduleResource) {
            }
        }

        export class AllByTaskRejected implements Action {
            public readonly type = DayCardActionEnum.RequestAllDayCardsByTaskRejected;

            constructor(public payload: string) {
            }
        }

        export class AllFromTasks implements Action {
            public readonly type = DayCardActionEnum.RequestAllDayCardsFromTasks;

            constructor(public payload: string[]) {
            }
        }

        export class AllFromTasksFulfilled implements Action {
            public readonly type = DayCardActionEnum.RequestAllDayCardsFromTasksFulfilled;

            constructor(public payload: TaskScheduleResource[]) {
            }
        }

        export class AllFromTasksRejected implements Action {
            public readonly type = DayCardActionEnum.RequestAllDayCardsFromTasksRejected;

            constructor(public payload: string[]) {
            }
        }

        export class All implements Action {
            public readonly type = DayCardActionEnum.RequestAllDayCard;

            constructor(public payload: string[]) {
            }
        }

        export class AllFulfilled implements Action {
            public readonly type = DayCardActionEnum.RequestAllDayCardFulfilled;

            constructor(public payload: DayCardResource[]) {
            }
        }

        export class AllRejected implements Action {
            public readonly type = DayCardActionEnum.RequestAllDayCardRejected;

            constructor() {
            }
        }

        export class AllReset implements Action {
            public readonly type = DayCardActionEnum.RequestAllDayCardReset;

            constructor() {
            }
        }
    }

    export namespace Create {
        export class One implements Action {
            public readonly type = DayCardActionEnum.CreateOneDayCard;

            constructor(public payload: CreateDayCardPayload) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = DayCardActionEnum.CreateOneDayCardFulfilled;

            constructor(public payload: TaskScheduleResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = DayCardActionEnum.CreateOneDayCardRejected;

            constructor(public payload: string) {
            }
        }

        export class OneReset implements Action {
            public readonly type = DayCardActionEnum.CreateOneDayCardReset;

            constructor() {
            }
        }
    }

    export namespace Delete {
        export class One implements Action {
            public readonly type = DayCardActionEnum.DeleteOneDayCard;

            constructor(public payload: DeleteDayCardPayload) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = DayCardActionEnum.DeleteOneDayCardFulfilled;

            constructor(public payload: TaskScheduleResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = DayCardActionEnum.DeleteOneDayCardRejected;

            constructor() {
            }
        }

        export class OneReset implements Action {
            public readonly type = DayCardActionEnum.DeleteOneDayCardReset;

            constructor() {
            }
        }

        export class All implements Action {
            public readonly type = DayCardActionEnum.DeleteAllDayCard;

            constructor(public payload: DeleteAllDayCardPayload) {
            }
        }

        export class AllFulfilled implements Action {
            public readonly type = DayCardActionEnum.DeleteAllDayCardFulfilled;

            constructor(public payload: TaskScheduleResource[]) {
            }
        }

        export class AllRejected implements Action {
            public readonly type = DayCardActionEnum.DeleteAllDayCardRejected;

            constructor() {
            }
        }

        export class AllReset implements Action {
            public readonly type = DayCardActionEnum.DeleteAllDayCardReset;

            constructor() {
            }
        }
    }

    export namespace Update {
        export class One implements Action {
            public readonly type = DayCardActionEnum.UpdateOneDayCard;

            constructor(public payload: UpdateDayCardPayload) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = DayCardActionEnum.UpdateOneDayCardFulfilled;

            constructor(public payload: DayCardResource) {
            }
        }

        export class OneWithScheduleFulfilled implements Action {
            public readonly type = DayCardActionEnum.UpdateOneDayCardWithScheduleFulfilled;

            constructor(public payload: TaskScheduleResource) {
            }
        }

        export class OnePartiallyFulfilled implements Action {
            public readonly type = DayCardActionEnum.UpdateOneDayCardPartiallyFulfilled;

            constructor(public payload: DayCardResource) {

            }
        }

        export class OneRejected implements Action {
            public readonly type = DayCardActionEnum.UpdateOneDayCardRejected;

            constructor() {
            }
        }

        export class Slots implements Action {
            public readonly type = DayCardActionEnum.UpdateSlots;

            constructor(public payload: UpdateSlotsPayload) {
            }
        }

        export class SlotsFulfilled implements Action {
            public readonly type = DayCardActionEnum.UpdateSlotsFulfilled;

            constructor(public payload: TaskScheduleResource) {
            }
        }

        export class SlotsRejected implements Action {
            public readonly type = DayCardActionEnum.UpdateSlotsRejected;

            constructor(public payload: string) {
            }
        }

        export class OneReset implements Action {
            public readonly type = DayCardActionEnum.UpdateOneDayCardReset;

            constructor() {
            }
        }
    }

    export namespace Approve {
        export class One implements Action {
            public readonly type = DayCardActionEnum.ApproveOneDayCard;

            constructor(public payload: string) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = DayCardActionEnum.ApproveOneDayCardFulfilled;

            constructor(public payload: DayCardResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = DayCardActionEnum.ApproveOneDayCardRejected;

            constructor() {
            }
        }

        export class OneReset implements Action {
            public readonly type = DayCardActionEnum.ApproveOneDayCardReset;

            constructor() {
            }
        }

        export class All implements Action {
            public readonly type = DayCardActionEnum.ApproveAllDayCard;

            constructor(public payload: string[]) {
            }
        }

        export class AllFulfilled implements Action {
            public readonly type = DayCardActionEnum.ApproveAllDayCardFulfilled;

            constructor(public payload: DayCardResource[]) {
            }
        }

        export class AllRejected implements Action {
            public readonly type = DayCardActionEnum.ApproveAllDayCardRejected;

            constructor(public payload: string[]) {
            }
        }

        export class AllReset implements Action {
            public readonly type = DayCardActionEnum.ApproveAllDayCardReset;

            constructor() {
            }
        }
    }

    export namespace Cancel {
        export class One implements Action {
            public readonly type = DayCardActionEnum.CancelOneDayCard;

            constructor(public payload: CancelDayCardPayload) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = DayCardActionEnum.CancelOneDayCardFulfilled;

            constructor(public payload: DayCardResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = DayCardActionEnum.CancelOneDayCardRejected;

            constructor() {
            }
        }

        export class OneReset implements Action {
            public readonly type = DayCardActionEnum.CancelOneDayCardReset;

            constructor() {
            }
        }

        export class All implements Action {
            public readonly type = DayCardActionEnum.CancelAllDayCard;

            constructor(public payload: CancelAllDayCardPayload) {
            }
        }

        export class AllFulfilled implements Action {
            public readonly type = DayCardActionEnum.CancelAllDayCardFulfilled;

            constructor(public payload: DayCardResource[]) {
            }
        }

        export class AllRejected implements Action {
            public readonly type = DayCardActionEnum.CancelAllDayCardRejected;

            constructor() {
            }
        }

        export class AllReset implements Action {
            public readonly type = DayCardActionEnum.CancelAllDayCardReset;

            constructor() {
            }
        }
    }

    export namespace Complete {
        export class One implements Action {
            public readonly type = DayCardActionEnum.CompleteOneDayCard;

            constructor(public payload: string) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = DayCardActionEnum.CompleteOneDayCardFulfilled;

            constructor(public payload: DayCardResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = DayCardActionEnum.CompleteOneDayCardRejected;

            constructor() {
            }
        }

        export class OneReset implements Action {
            public readonly type = DayCardActionEnum.CompleteOneDayCardReset;

            constructor() {
            }
        }

        export class All implements Action {
            public readonly type = DayCardActionEnum.CompleteAllDayCard;

            constructor(public payload: string[]) {
            }
        }

        export class AllFulfilled implements Action {
            public readonly type = DayCardActionEnum.CompleteAllDayCardFulfilled;

            constructor(public payload: DayCardResource[]) {
            }
        }

        export class AllRejected implements Action {
            public readonly type = DayCardActionEnum.CompleteAllDayCardRejected;

            constructor() {
            }
        }

        export class AllReset implements Action {
            public readonly type = DayCardActionEnum.CompleteAllDayCardReset;

            constructor() {
            }
        }
    }

    export namespace Reset {
        export class One implements Action {
            public readonly type = DayCardActionEnum.ResetOneDayCard;

            constructor(public payload: string) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = DayCardActionEnum.ResetOneDayCardFulfilled;

            constructor(public payload: DayCardResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = DayCardActionEnum.ResetOneDayCardRejected;

            constructor() {
            }
        }

        export class OneReset implements Action {
            public readonly type = DayCardActionEnum.ResetOneDayCardReset;

            constructor() {
            }
        }
    }
}

export interface CancelDayCardPayload {
    dayCardId: string;
    reason: RfvKey;
}

export interface CancelAllDayCardPayload {
    dayCardIds: string[];
    reason: RfvKey;
}

export interface CreateDayCardPayload {
    taskId: string;
    saveDayCard: SaveDayCardResource;
}

export interface DeleteDayCardPayload {
    taskId: string;
    dayCardId: string;
}

export interface UpdateDayCardPayload {
    taskId: string;
    dayCardId: string;
    dayCardVersion: number;
    taskScheduleVersion: number;
    saveDayCard: SaveDayCardResource;
}

export interface UpdateSlotsPayload {
    taskId: string;
    dayCardId: string;
    currentDate: Moment;
}

export interface DeleteAllDayCardPayload {
    dayCardIds: string[];
}

export type DayCardActions =
    DayCardActions.Initialize.All |
    DayCardActions.Request.One |
    DayCardActions.Request.OneFulfilled |
    DayCardActions.Request.OneRejected |
    DayCardActions.Request.AllByTask |
    DayCardActions.Request.AllByTaskFulfilled |
    DayCardActions.Request.AllByTaskRejected |
    DayCardActions.Request.AllFromTasks |
    DayCardActions.Request.AllFromTasksFulfilled |
    DayCardActions.Request.AllFromTasksRejected |
    DayCardActions.Request.All |
    DayCardActions.Request.AllFulfilled |
    DayCardActions.Request.AllRejected |
    DayCardActions.Request.AllReset |
    DayCardActions.Create.One |
    DayCardActions.Create.OneFulfilled |
    DayCardActions.Create.OneRejected |
    DayCardActions.Create.OneReset |
    DayCardActions.Delete.One |
    DayCardActions.Delete.OneFulfilled |
    DayCardActions.Delete.OneRejected |
    DayCardActions.Delete.OneReset |
    DayCardActions.Delete.All |
    DayCardActions.Delete.AllFulfilled |
    DayCardActions.Delete.AllRejected |
    DayCardActions.Delete.AllReset |
    DayCardActions.Update.One |
    DayCardActions.Update.OneFulfilled |
    DayCardActions.Update.OneWithScheduleFulfilled |
    DayCardActions.Update.OnePartiallyFulfilled |
    DayCardActions.Update.OneRejected |
    DayCardActions.Update.OneReset |
    DayCardActions.Update.Slots |
    DayCardActions.Update.SlotsFulfilled |
    DayCardActions.Update.SlotsRejected |
    DayCardActions.Approve.One |
    DayCardActions.Approve.OneFulfilled |
    DayCardActions.Approve.OneRejected |
    DayCardActions.Approve.OneReset |
    DayCardActions.Approve.All |
    DayCardActions.Approve.AllFulfilled |
    DayCardActions.Approve.AllRejected |
    DayCardActions.Approve.AllReset |
    DayCardActions.Cancel.One |
    DayCardActions.Cancel.OneFulfilled |
    DayCardActions.Cancel.OneRejected |
    DayCardActions.Cancel.OneReset |
    DayCardActions.Cancel.All |
    DayCardActions.Cancel.AllFulfilled |
    DayCardActions.Cancel.AllRejected |
    DayCardActions.Cancel.AllReset |
    DayCardActions.Complete.One |
    DayCardActions.Complete.OneFulfilled |
    DayCardActions.Complete.OneRejected |
    DayCardActions.Complete.OneReset |
    DayCardActions.Complete.All |
    DayCardActions.Complete.AllFulfilled |
    DayCardActions.Complete.AllRejected |
    DayCardActions.Complete.AllReset |
    DayCardActions.Reset.One |
    DayCardActions.Reset.OneFulfilled |
    DayCardActions.Reset.OneRejected |
    DayCardActions.Reset.OneReset;
