/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';
import * as moment from 'moment';

import {SorterData} from '../../../../shared/ui/sorter/sorter-data.datastructure';
import {ProjectTasksCreateContext} from '../../../project-children/project-tasks/containers/tasks-create/project-tasks-create.component';
import {SaveCopyTaskResource} from '../../api/tasks/resources/save-copy-task.resource';
import {SaveTaskResource} from '../../api/tasks/resources/save-task.resource';
import {TaskResource} from '../../api/tasks/resources/task.resource';
import {ProjectTaskListResource} from '../../api/tasks/resources/task-list.resource';
import {TaskScheduleResource} from '../../api/tasks/resources/task-schedule.resource';
import {TasksSortField} from '../../api/tasks/task.service';
import {ProjectTaskFilters} from './slice/project-task-filters';

export enum TaskActionEnum {
    InitializeAll = '[Tasks] Initialize all',
    InitializeAssignment = '[Tasks] Initialize assignment',
    InitializeCalendar = '[Tasks] Initialize all of calendar',
    InitializeCalendarItems = '[Tasks] Initialize calendar items',
    InitializeCurrent = '[Tasks] Initialize current',
    InitializeListItems = '[Tasks] Initialize list items',
    InitializeSending = '[Tasks] Initialize sending',
    AssignAll = '[Tasks] Assign all',
    AssignAllFulfilled = '[Tasks] Assign all fulfilled',
    AssignAllRejected = '[Tasks] Assign all rejected',
    AcceptAll = '[Tasks] Accept all',
    AcceptAllFulfilled = '[Tasks] Accept all fulfilled',
    AcceptAllRejected = '[Tasks] Accept all rejected',
    AcceptOne = '[Tasks] Accept one',
    AcceptOneFulfilled = '[Tasks] Accept one fulfilled',
    AcceptOneRejected = '[Tasks] Accept one rejected',
    CloseAll = '[Tasks] Close all',
    CloseAllFulfilled = '[Tasks] Close all fulfilled',
    CloseAllRejected = '[Tasks] Close all rejected',
    CloseOne = '[Tasks] Close one',
    CloseOneFulfilled = '[Tasks] Close one fulfilled',
    CloseOneRejected = '[Tasks] Close one rejected',
    CopyAll = '[Tasks] Copy all',
    CopyAllFulfilled = '[Tasks] Copy all fulfilled',
    CopyAllRejected = '[Tasks] Copy all rejected',
    CreateOne = '[Tasks] Create one',
    CreateOneFulfilled = '[Tasks] Create one fulfilled',
    CreateOnePartiallyFulfilled = '[Tasks] Create one partially fulfilled',
    CreateOneRejected = '[Tasks] Create one rejected',
    CreateOneReset = '[Tasks] Create one reset',
    CreateAll = '[Tasks] Create all',
    CreateAllFulfilled = '[Tasks] Create all fulfilled',
    CreateAllRejected = '[Tasks] Create all rejected',
    CreateAllReset = '[Tasks] Create all reset',
    DeleteOne = '[Tasks] Delete one',
    DeleteOneFulfilled = '[Tasks] Delete one fulfilled',
    DeleteOneRejected = '[Tasks] Delete one rejected',
    DeleteAll = '[Tasks] Delete all',
    DeleteAllFulfilled = '[Tasks] Delete all fulfilled',
    DeleteAllRejected = '[Tasks] Delete all rejected',
    DeleteOneReset = '[Tasks] Delete one reset',
    MoveOne = '[Tasks] Move one',
    MoveOneFulfilled = '[Tasks] Move one fulfilled',
    MoveOneRejected = '[Tasks] Move one rejected',
    MoveAll = '[Tasks] Move all',
    MoveAllFulfilled = '[Tasks] Move all fulfilled',
    MoveAllRejected = '[Tasks] Move all rejected',
    RequestAll = '[Tasks] Request all',
    RequestAllCalendar = '[Tasks] Request all of calendar',
    RequestAllCalendarFulfilled = '[Tasks] Request all of calendar fulfilled',
    RequestAllCalendarRejected = '[Tasks] Request all of calendar rejected',
    RequestAllFulfilled = '[Tasks] Request all fulfilled',
    RequestAllRejected = '[Tasks] Request all rejected',
    RequestAllByIds = '[Tasks] Request all by ids',
    RequestAllByIdsFulfilled = '[Tasks] Request all by ids fulfilled',
    RequestAllByIdsRejected = '[Tasks] Request all by ids rejected',
    RequestOne = '[Tasks] Request one',
    RequestOneFulfilled = '[Tasks] Request one fulfilled',
    RequestOneRejected = '[Tasks] Request one rejected',
    RequestOneTaskScheduleByTaskId = '[Tasks] Request task schedule by task id',
    RequestOneTaskScheduleByTaskIdFulfilled = '[Tasks] Request task schedule by task id fulfilled',
    RequestOneTaskScheduleByTaskIdRejected = '[Tasks] Request task schedule by task id rejected',
    ResetAll = '[Tasks] Reset all',
    ResetAllFulfilled = '[Tasks] Reset all fulfilled',
    ResetAllRejected = '[Tasks] Reset all rejected',
    ResetOne = '[Tasks] Reset one',
    ResetOneFulfilled = '[Tasks] Reset one fulfilled',
    ResetOneRejected = '[Tasks] Reset one rejected',
    ResizeOne = '[Tasks] Resize one',
    ResizeOneFulfilled = '[Tasks] Resize one fulfilled',
    ResizeOneRejected = '[Tasks] Resize one rejected',
    SendAll = '[Tasks] Send all',
    SendAllFulfilled = '[Tasks] Send all fulfilled',
    SendAllRejected = '[Tasks] Send all rejected',
    SendOne = '[Tasks] Send one',
    SendOneFulfilled = '[Tasks] Send one fulfilled',
    SendOneRejected = '[Tasks] Send one rejected',
    SetAssignIds = '[Tasks] Assign ids',
    SetAssignSelecting = '[Tasks] Assign selecting',
    SetCalendarFilterPanelVisibility = '[Tasks] Set calendar filters visibility',
    SetCalendarFilters = '[Tasks] Set calendar filters',
    SetCalendarItems = '[Tasks] Set calendar items',
    SetCalendarPage = '[Tasks] Set calendar page',
    SetCalendarSort = '[Tasks] Set calendar sort',
    SetCurrent = '[Tasks] Set current',
    SetFilterPanelVisibility = '[Tasks] Set filters visibility',
    SetFilters = '[Tasks] Set filters',
    SetItems = '[Tasks] Set items',
    SetPage = '[Tasks] Set page',
    SetSendIds = '[Tasks] Send ids',
    SetSendSelecting = '[Tasks] Send selecting',
    SetSort = '[Tasks] Set sort',
    StartAll = '[Tasks] Start all',
    StartAllFulfilled = '[Tasks] Start all fulfilled',
    StartAllRejected = '[Tasks] Start all rejected',
    StartOne = '[Tasks] Start one',
    StartOneFulfilled = '[Tasks] Start one fulfilled',
    StartOneRejected = '[Tasks] Start one rejected',
    UpdateOne = '[Tasks] Update one',
    UpdateOneFulfilled = '[Tasks] Update one fulfilled',
    UpdateOnePartiallyFulfilled = '[Tasks] Update one partially fulfilled',
    UpdateOneRejected = '[Tasks] Update one rejected',
    UpdateOneReset = '[Tasks] Update one reset',
}

export namespace ProjectTaskActions {

    export namespace Initialize {
        export class All implements Action {
            public readonly type = TaskActionEnum.InitializeAll;

            constructor() {
            }
        }

        export class Assignment implements Action {
            public readonly type = TaskActionEnum.InitializeAssignment;

            constructor() {
            }
        }

        export class Sending implements Action {
            public readonly type = TaskActionEnum.InitializeSending;

            constructor() {
            }
        }

        export class Current implements Action {
            public readonly type = TaskActionEnum.InitializeCurrent;

            constructor() {
            }
        }

        export class Calendar implements Action {
            public readonly type = TaskActionEnum.InitializeCalendar;

            constructor() {
            }
        }

        export class CalendarItems implements Action {
            public readonly type = TaskActionEnum.InitializeCalendarItems;

            constructor() {
            }
        }

        export class ListItems implements Action {
            public readonly type = TaskActionEnum.InitializeListItems;

            constructor() {
            }
        }
    }

    export namespace Request {
        export class One implements Action {
            public readonly type = TaskActionEnum.RequestOne;

            constructor(public payload: string) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = TaskActionEnum.RequestOneFulfilled;

            constructor(public payload: TaskResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = TaskActionEnum.RequestOneRejected;
        }

        export class OneTaskScheduleByTaskId implements Action {
            public readonly type = TaskActionEnum.RequestOneTaskScheduleByTaskId;

            constructor(public payload: string) {
            }
        }

        export class OneTaskScheduleByTaskIdFulfilled implements Action {
            public readonly type = TaskActionEnum.RequestOneTaskScheduleByTaskIdFulfilled;

            constructor(public payload: TaskScheduleResource) {
            }
        }

        export class OneTaskScheduleByTaskIdRejected implements Action {
            public readonly type = TaskActionEnum.RequestOneTaskScheduleByTaskIdRejected;
        }

        export class All implements Action {
            public readonly type = TaskActionEnum.RequestAll;

            constructor() {
            }
        }

        export class AllFulfilled implements Action {
            public readonly type = TaskActionEnum.RequestAllFulfilled;

            constructor(public payload: any) {
            }
        }

        export class AllRejected implements Action {
            public readonly type = TaskActionEnum.RequestAllRejected;

            constructor() {
            }
        }

        export class AllCalendar implements Action {
            public readonly type = TaskActionEnum.RequestAllCalendar;

            constructor() {
            }
        }

        export class AllCalendarFulfilled implements Action {
            public readonly type = TaskActionEnum.RequestAllCalendarFulfilled;

            constructor(public payload: ProjectTaskListResource) {
            }
        }

        export class AllCalendarRejected implements Action {
            public readonly type = TaskActionEnum.RequestAllCalendarRejected;

            constructor() {
            }
        }

        export class AllByIds implements Action {
            public readonly type = TaskActionEnum.RequestAllByIds;

            constructor(public ids: string[]) {
            }
        }

        export class AllByIdsFulfilled implements Action {
            public readonly type = TaskActionEnum.RequestAllByIdsFulfilled;

            constructor(public payload: TaskResource[]) {
            }
        }

        export class AllByIdsRejected implements Action {
            public readonly type = TaskActionEnum.RequestAllByIdsRejected;

            constructor() {
            }
        }
    }

    export namespace Assign {
        export class All implements Action {
            public readonly type = TaskActionEnum.AssignAll;

            constructor(public payload: any) {
            }
        }

        export class AllFulfilled implements Action {
            public readonly type = TaskActionEnum.AssignAllFulfilled;

            constructor(public payload: ProjectTaskListResource) {
            }
        }

        export class AllRejected implements Action {
            public readonly type = TaskActionEnum.AssignAllRejected;

            constructor() {
            }
        }
    }

    export namespace Send {
        export class All implements Action {
            public readonly type = TaskActionEnum.SendAll;

            constructor(public payload: string[]) {
            }
        }

        export class AllFulfilled implements Action {
            public readonly type = TaskActionEnum.SendAllFulfilled;

            constructor(public payload: TaskResource[]) {
            }
        }

        export class AllRejected implements Action {
            public readonly type = TaskActionEnum.SendAllRejected;

            constructor() {
            }
        }

        export class One implements Action {
            public readonly type = TaskActionEnum.SendOne;

            constructor(public payload: string) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = TaskActionEnum.SendOneFulfilled;

            constructor(public payload: TaskResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = TaskActionEnum.SendOneRejected;

            constructor() {
            }
        }
    }

    export namespace Start {
        export class All implements Action {
            public readonly type = TaskActionEnum.StartAll;

            constructor(public payload: string[]) {
            }
        }

        export class AllFulfilled implements Action {
            public readonly type = TaskActionEnum.StartAllFulfilled;

            constructor(public payload: TaskResource[]) {
            }
        }

        export class AllRejected implements Action {
            public readonly type = TaskActionEnum.StartAllRejected;

            constructor() {
            }
        }

        export class One implements Action {
            public readonly type = TaskActionEnum.StartOne;

            constructor(public payload: string) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = TaskActionEnum.StartOneFulfilled;

            constructor(public payload: TaskResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = TaskActionEnum.StartOneRejected;

            constructor() {
            }
        }
    }

    export namespace Accept {
        export class All implements Action {
            public readonly type = TaskActionEnum.AcceptAll;

            constructor(public payload: string[]) {
            }
        }

        export class AllFulfilled implements Action {
            public readonly type = TaskActionEnum.AcceptAllFulfilled;

            constructor(public payload: TaskResource[]) {
            }
        }

        export class AllRejected implements Action {
            public readonly type = TaskActionEnum.AcceptAllRejected;

            constructor() {
            }
        }

        export class One implements Action {
            public readonly type = TaskActionEnum.AcceptOne;

            constructor(public payload: string) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = TaskActionEnum.AcceptOneFulfilled;

            constructor(public payload: TaskResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = TaskActionEnum.AcceptOneRejected;

            constructor() {
            }
        }
    }
    export namespace Close {
        export class All implements Action {
            public readonly type = TaskActionEnum.CloseAll;

            constructor(public payload: string[]) {
            }
        }

        export class AllFulfilled implements Action {
            public readonly type = TaskActionEnum.CloseAllFulfilled;

            constructor(public payload: TaskResource[]) {
            }
        }

        export class AllRejected implements Action {
            public readonly type = TaskActionEnum.CloseAllRejected;

            constructor() {
            }
        }

        export class One implements Action {
            public readonly type = TaskActionEnum.CloseOne;

            constructor(public payload: string) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = TaskActionEnum.CloseOneFulfilled;

            constructor(public payload: TaskResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = TaskActionEnum.CloseOneRejected;

            constructor() {
            }
        }
    }

    export namespace Reset {
        export class All implements Action {
            public readonly type = TaskActionEnum.ResetAll;

            constructor(public payload: string[]) {
            }
        }

        export class AllFulfilled implements Action {
            public readonly type = TaskActionEnum.ResetAllFulfilled;

            constructor(public payload: TaskResource[]) {
            }
        }

        export class AllRejected implements Action {
            public readonly type = TaskActionEnum.ResetAllRejected;

            constructor() {
            }
        }

        export class One implements Action {
            public readonly type = TaskActionEnum.ResetOne;

            constructor(public payload: string) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = TaskActionEnum.ResetOneFulfilled;

            constructor(public payload: TaskResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = TaskActionEnum.ResetOneRejected;

            constructor() {
            }
        }
    }

    export namespace Set {
        export class Current implements Action {
            public readonly type = TaskActionEnum.SetCurrent;

            constructor(public payload: string) {
            }
        }

        export class Page implements Action {
            public readonly type = TaskActionEnum.SetPage;

            constructor(public payload: number) {
            }
        }

        export class Items implements Action {
            public readonly type = TaskActionEnum.SetItems;

            constructor(public payload: number) {
            }
        }

        export class Sort implements Action {
            public readonly type = TaskActionEnum.SetSort;

            constructor(public payload: SorterData) {
            }
        }

        export class Filters implements Action {
            public readonly type = TaskActionEnum.SetFilters;

            constructor(public payload: ProjectTaskFilters) {
            }
        }

        export class FilterPanelVisibility implements Action {
            public readonly type = TaskActionEnum.SetFilterPanelVisibility;

            constructor(public payload: boolean) {
            }
        }

        export class CalendarPage implements Action {
            public readonly type = TaskActionEnum.SetCalendarPage;

            constructor(public payload: number) {
            }
        }

        export class CalendarItems implements Action {
            public readonly type = TaskActionEnum.SetCalendarItems;

            constructor(public payload: number) {
            }
        }

        export class CalendarSort implements Action {
            public readonly type = TaskActionEnum.SetCalendarSort;

            constructor(public payload: SorterData<TasksSortField>) {
            }
        }

        export class CalendarFilters implements Action {
            public readonly type = TaskActionEnum.SetCalendarFilters;

            constructor(public payload: ProjectTaskFilters) {
            }
        }

        export class CalendarFilterPanelVisibility implements Action {
            public readonly type = TaskActionEnum.SetCalendarFilterPanelVisibility;

            constructor(public payload: boolean) {
            }
        }

        export class AssignSelecting implements Action {
            public readonly type = TaskActionEnum.SetAssignSelecting;

            constructor(public payload: boolean) {
            }
        }

        export class AssignIds implements Action {
            public readonly type = TaskActionEnum.SetAssignIds;

            constructor(public payload: string[]) {
            }
        }

        export class SendSelecting implements Action {
            public readonly type = TaskActionEnum.SetSendSelecting;

            constructor(public payload: boolean) {
            }
        }

        export class SendIds implements Action {
            public readonly type = TaskActionEnum.SetSendIds;

            constructor(public payload: string[]) {
            }
        }
    }

    export namespace Create {
        export class One implements Action {
            public readonly type = TaskActionEnum.CreateOne;

            constructor(public payload: SaveTaskResource, public context: ProjectTasksCreateContext) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = TaskActionEnum.CreateOneFulfilled;

            constructor(public context: ProjectTasksCreateContext) {
            }
        }

        export class OnePartiallyFulfilled implements Action {
            public readonly type = TaskActionEnum.CreateOnePartiallyFulfilled;

            constructor() {
            }
        }

        export class OneRejected implements Action {
            public readonly type = TaskActionEnum.CreateOneRejected;

            constructor() {
            }
        }

        export class OneReset implements Action {
            public readonly type = TaskActionEnum.CreateOneReset;

            constructor() {
            }
        }

        export class All implements Action {
            public readonly type = TaskActionEnum.CreateAll;

            constructor(public payload: SaveTaskResource[]) {
            }
        }

        export class AllFulfilled implements Action {
            public readonly type = TaskActionEnum.CreateAllFulfilled;

            constructor(public payload: CreateOrUpdateTaskFulfilledPayload[]) {
            }
        }

        export class AllRejected implements Action {
            public readonly type = TaskActionEnum.CreateAllRejected;

            constructor() {
            }
        }

        export class AllReset implements Action {
            public readonly type = TaskActionEnum.CreateAllReset;

            constructor() {
            }
        }
    }

    export namespace Copy {
        export class All implements Action {
            public readonly type = TaskActionEnum.CopyAll;

            constructor(public payload: SaveCopyTaskResource[]) {
            }
        }

        export class AllFulfilled implements Action {
            public readonly type = TaskActionEnum.CopyAllFulfilled;

            constructor(public payload: TaskResource[]) {
            }
        }

        export class AllRejected implements Action {
            public readonly type = TaskActionEnum.CopyAllRejected;
        }
    }

    export namespace Delete {
        export class One implements Action {
            public readonly type = TaskActionEnum.DeleteOne;

            constructor(public payload: string) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = TaskActionEnum.DeleteOneFulfilled;

            constructor(public payload: string) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = TaskActionEnum.DeleteOneRejected;

            constructor() {
            }
        }

        export class OneReset implements Action {
            public readonly type = TaskActionEnum.DeleteOneReset;

            constructor() {
            }
        }

        export class All implements Action {
            public readonly type = TaskActionEnum.DeleteAll;

            constructor(public payload: string[]) {
            }
        }

        export class AllFulfilled implements Action {
            public readonly type = TaskActionEnum.DeleteAllFulfilled;

            constructor(public payload: string[]) {
            }
        }

        export class AllRejected implements Action {
            public readonly type = TaskActionEnum.DeleteAllRejected;

            constructor() {
            }
        }
    }

    export namespace Update {
        export class One implements Action {
            public readonly type = TaskActionEnum.UpdateOne;

            constructor(public payload: UpdateTaskPayload) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = TaskActionEnum.UpdateOneFulfilled;

            constructor(public payload: string) {
            }
        }

        export class OnePartiallyFulfilled implements Action {
            public readonly type = TaskActionEnum.UpdateOnePartiallyFulfilled;

            constructor(public payload: string) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = TaskActionEnum.UpdateOneRejected;

            constructor() {
            }
        }

        export class OneReset implements Action {
            public readonly type = TaskActionEnum.UpdateOneReset;

            constructor() {
            }
        }
    }

    export namespace Move {
        export class One implements Action {
            public readonly type = TaskActionEnum.MoveOne;

            constructor(public payload: MoveTaskPayload) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = TaskActionEnum.MoveOneFulfilled;

            constructor(public payload: CreateOrUpdateTaskFulfilledPayload) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = TaskActionEnum.MoveOneRejected;

            constructor(public payload: string) {
            }
        }

        export class All implements Action {
            public readonly type = TaskActionEnum.MoveAll;

            constructor(public payload: MoveTaskPayload[]) {
            }
        }

        export class AllFulfilled implements Action {
            public readonly type = TaskActionEnum.MoveAllFulfilled;

            constructor(public payload: CreateOrUpdateTaskFulfilledPayload[]) {
            }
        }

        export class AllRejected implements Action {
            public readonly type = TaskActionEnum.MoveAllRejected;

            constructor(public payload: string[]) {
            }
        }
    }

    export namespace Resize {
        export class One implements Action {
            public readonly type = TaskActionEnum.ResizeOne;

            constructor(public payload: ResizeTaskPayload) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = TaskActionEnum.ResizeOneFulfilled;

            constructor(public payload: TaskScheduleResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = TaskActionEnum.ResizeOneRejected;

            constructor(public payload: string) {
            }
        }
    }
}

export interface UpdateTaskPayload {
    taskId: string;
    taskVersion: number;
    taskScheduleVersion: number;
    payload: SaveTaskResource;
}

export interface MoveTaskPayload {
    taskId: string;
    start: moment.Moment;
    end: moment.Moment;
    workAreaId: string;
}

export interface ResizeTaskPayload {
    taskId: string;
    start: moment.Moment;
    end: moment.Moment;
}

// TODO Try to improve in the future by changing this to a TaskResource and injecting the schedule in the embedded attribute
export interface CreateOrUpdateTaskFulfilledPayload {
    taskId: string;
    schedule: TaskScheduleResource;
    task: TaskResource;
}

export type ProjectTaskActions =
    ProjectTaskActions.Initialize.All |
    ProjectTaskActions.Initialize.Assignment |
    ProjectTaskActions.Initialize.Sending |
    ProjectTaskActions.Initialize.Current |
    ProjectTaskActions.Initialize.Calendar |
    ProjectTaskActions.Initialize.CalendarItems |
    ProjectTaskActions.Initialize.ListItems |
    ProjectTaskActions.Request.OneTaskScheduleByTaskId |
    ProjectTaskActions.Request.OneTaskScheduleByTaskIdFulfilled |
    ProjectTaskActions.Request.OneTaskScheduleByTaskIdRejected |
    ProjectTaskActions.Request.One |
    ProjectTaskActions.Request.OneFulfilled |
    ProjectTaskActions.Request.OneRejected |
    ProjectTaskActions.Request.All |
    ProjectTaskActions.Request.AllFulfilled |
    ProjectTaskActions.Request.AllRejected |
    ProjectTaskActions.Request.AllCalendar |
    ProjectTaskActions.Request.AllCalendarFulfilled |
    ProjectTaskActions.Request.AllCalendarRejected |
    ProjectTaskActions.Request.AllByIds |
    ProjectTaskActions.Request.AllByIdsFulfilled |
    ProjectTaskActions.Request.AllByIdsRejected |
    ProjectTaskActions.Assign.All |
    ProjectTaskActions.Assign.AllFulfilled |
    ProjectTaskActions.Assign.AllRejected |
    ProjectTaskActions.Send.All |
    ProjectTaskActions.Send.AllFulfilled |
    ProjectTaskActions.Send.AllRejected |
    ProjectTaskActions.Send.One |
    ProjectTaskActions.Send.OneFulfilled |
    ProjectTaskActions.Send.OneRejected |
    ProjectTaskActions.Start.All |
    ProjectTaskActions.Start.AllFulfilled |
    ProjectTaskActions.Start.AllRejected |
    ProjectTaskActions.Start.One |
    ProjectTaskActions.Start.OneFulfilled |
    ProjectTaskActions.Start.OneRejected |
    ProjectTaskActions.Accept.All |
    ProjectTaskActions.Accept.AllFulfilled |
    ProjectTaskActions.Accept.AllRejected |
    ProjectTaskActions.Accept.One |
    ProjectTaskActions.Accept.OneFulfilled |
    ProjectTaskActions.Accept.OneRejected |
    ProjectTaskActions.Close.All |
    ProjectTaskActions.Close.AllFulfilled |
    ProjectTaskActions.Close.AllRejected |
    ProjectTaskActions.Close.One |
    ProjectTaskActions.Close.OneFulfilled |
    ProjectTaskActions.Close.OneRejected |
    ProjectTaskActions.Reset.All |
    ProjectTaskActions.Reset.AllFulfilled |
    ProjectTaskActions.Reset.AllRejected |
    ProjectTaskActions.Reset.One |
    ProjectTaskActions.Reset.OneFulfilled |
    ProjectTaskActions.Reset.OneRejected |
    ProjectTaskActions.Set.Current |
    ProjectTaskActions.Set.Page |
    ProjectTaskActions.Set.Items |
    ProjectTaskActions.Set.Sort |
    ProjectTaskActions.Set.Filters |
    ProjectTaskActions.Set.FilterPanelVisibility |
    ProjectTaskActions.Set.CalendarPage |
    ProjectTaskActions.Set.CalendarItems |
    ProjectTaskActions.Set.CalendarSort |
    ProjectTaskActions.Set.CalendarFilters |
    ProjectTaskActions.Set.CalendarFilterPanelVisibility |
    ProjectTaskActions.Set.AssignSelecting |
    ProjectTaskActions.Set.AssignIds |
    ProjectTaskActions.Set.SendSelecting |
    ProjectTaskActions.Set.SendIds |
    ProjectTaskActions.Create.One |
    ProjectTaskActions.Create.OneFulfilled |
    ProjectTaskActions.Create.OnePartiallyFulfilled |
    ProjectTaskActions.Create.OneRejected |
    ProjectTaskActions.Create.OneReset |
    ProjectTaskActions.Create.All |
    ProjectTaskActions.Create.AllFulfilled |
    ProjectTaskActions.Create.AllRejected |
    ProjectTaskActions.Create.AllReset |
    ProjectTaskActions.Copy.All |
    ProjectTaskActions.Copy.AllFulfilled |
    ProjectTaskActions.Copy.AllRejected |
    ProjectTaskActions.Update.One |
    ProjectTaskActions.Update.OneFulfilled |
    ProjectTaskActions.Update.OnePartiallyFulfilled |
    ProjectTaskActions.Update.OneRejected |
    ProjectTaskActions.Update.OneReset |
    ProjectTaskActions.Move.One |
    ProjectTaskActions.Move.OneFulfilled |
    ProjectTaskActions.Move.OneRejected |
    ProjectTaskActions.Move.All |
    ProjectTaskActions.Move.AllFulfilled |
    ProjectTaskActions.Move.AllRejected |
    ProjectTaskActions.Delete.One |
    ProjectTaskActions.Delete.OneFulfilled |
    ProjectTaskActions.Delete.OneRejected |
    ProjectTaskActions.Delete.OneReset |
    ProjectTaskActions.Delete.All |
    ProjectTaskActions.Delete.AllFulfilled |
    ProjectTaskActions.Delete.AllRejected |
    ProjectTaskActions.Resize.One |
    ProjectTaskActions.Resize.OneFulfilled |
    ProjectTaskActions.Resize.OneRejected;
