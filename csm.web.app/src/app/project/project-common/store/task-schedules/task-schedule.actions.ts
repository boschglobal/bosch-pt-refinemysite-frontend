/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {DayCardActions} from '../day-cards/day-card.actions';
import {ProjectTaskActions} from '../tasks/task.actions';

export enum TaskScheduleActionEnum {
    InitializeAll = '[Task Schedule] Initialize all',
}

export namespace TaskScheduleActions {

    export namespace Initialize {
        export class All implements Action {
            public readonly type = TaskScheduleActionEnum.InitializeAll;

            constructor() {
            }
        }
    }
}

export type TaskScheduleActions =
    TaskScheduleActions.Initialize.All |
    DayCardActions.Request.AllByTask |
    DayCardActions.Request.AllByTaskFulfilled |
    DayCardActions.Request.AllByTaskRejected |
    DayCardActions.Request.AllFromTasks |
    DayCardActions.Request.AllFromTasksFulfilled |
    DayCardActions.Request.AllFromTasksRejected |
    DayCardActions.Create.One |
    DayCardActions.Create.OneFulfilled |
    DayCardActions.Create.OneRejected |
    DayCardActions.Delete.OneFulfilled |
    DayCardActions.Delete.AllFulfilled |
    DayCardActions.Update.OneWithScheduleFulfilled |
    DayCardActions.Update.Slots |
    DayCardActions.Update.SlotsFulfilled |
    DayCardActions.Update.SlotsRejected |
    DayCardActions.Approve.All |
    DayCardActions.Approve.AllFulfilled |
    DayCardActions.Approve.AllRejected |
    ProjectTaskActions.Copy.AllFulfilled |
    ProjectTaskActions.Create.AllFulfilled |
    ProjectTaskActions.Move.One |
    ProjectTaskActions.Move.OneFulfilled |
    ProjectTaskActions.Move.OneRejected |
    ProjectTaskActions.Move.All |
    ProjectTaskActions.Move.AllFulfilled |
    ProjectTaskActions.Move.AllRejected |
    ProjectTaskActions.Request.OneTaskScheduleByTaskIdFulfilled |
    ProjectTaskActions.Request.OneFulfilled |
    ProjectTaskActions.Request.AllFulfilled |
    ProjectTaskActions.Request.AllCalendarFulfilled |
    ProjectTaskActions.Request.AllByIdsFulfilled |
    ProjectTaskActions.Assign.AllFulfilled |
    ProjectTaskActions.Send.AllFulfilled |
    ProjectTaskActions.Start.OneFulfilled |
    ProjectTaskActions.Close.OneFulfilled |
    ProjectTaskActions.Delete.OneFulfilled |
    ProjectTaskActions.Delete.AllFulfilled |
    ProjectTaskActions.Resize.One |
    ProjectTaskActions.Resize.OneFulfilled |
    ProjectTaskActions.Resize.OneRejected;
