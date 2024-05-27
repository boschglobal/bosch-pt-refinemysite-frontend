/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {EmployeeListResource} from '../api/resources/employee-list.resource';
import {EmployeeResource} from '../api/resources/employee.resource';
import {EmployeeSaveResource} from '../api/resources/employee-save.resource';
import {SorterData} from '../../../shared/ui/sorter/sorter-data.datastructure';

export enum EmployeeActionsEnum {
    InitializeAll = '[Employee] Initialize all',
    InitializeCurrent = '[Employee] Initialize current',
    CreateOne = '[Employee] Create one',
    CreateOneFulfilled = '[Employee] Create one fulfilled',
    CreateOneRejected = '[Employee] Create one rejected',
    CreateOneReset = '[Employee] Create one reset',
    DeleteOne = '[Employee] Delete one',
    DeleteOneFulfilled = '[Employee] Delete one fulfilled',
    DeleteOneRejected = '[Employee] Delete one rejected',
    DeleteOneReset = '[Employee] Delete one reset',
    RequestPage = '[Employee] Request employee list page',
    RequestPageFulfilled = '[Employee] Request employee list page fulfilled',
    RequestPageRejected = '[Employee] Request employee list page rejected',
    RequestOne = '[Employee] Request employee',
    RequestOneFulfilled = '[Employee] Request employee fulfilled',
    RequestOneRejected = '[Employee] Request employee rejected',
    SetCurrent = '[Employee] Set current',
    SetPage = '[Employee] Set page',
    SetPageSize = '[Employee] Set items',
    SetSort = '[Employee] Set sort',
    UpdateOne = '[Employee] Update one',
    UpdateOneFulfilled = '[Employee] Update one fulfilled',
    UpdateOneRejected = '[Employee] Update one rejected',
}

export namespace EmployeeActions {

    export namespace Initialize {
        export class All implements Action {
            readonly type = EmployeeActionsEnum.InitializeAll;

            constructor() {
            }
        }

        export class Current implements Action {
            readonly type = EmployeeActionsEnum.InitializeCurrent;

            constructor() {
            }
        }
    }

    export namespace Request {

        export class RequestPage implements Action {
            readonly type = EmployeeActionsEnum.RequestPage;

            constructor() {
            }
        }

        export class RequestPageFulfilled implements Action {
            readonly type = EmployeeActionsEnum.RequestPageFulfilled;

            constructor(public payload: EmployeeListResource) {
            }
        }

        export class RequestPageRejected implements Action {
            readonly type = EmployeeActionsEnum.RequestPageRejected;

            constructor() {
            }
        }

        export class One implements Action {
            readonly type = EmployeeActionsEnum.RequestOne;

            constructor(public id: string) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = EmployeeActionsEnum.RequestOneFulfilled;

            constructor(public payload: EmployeeResource) {
            }
        }

        export class OneRejected implements Action {
            readonly type = EmployeeActionsEnum.RequestOneRejected;

            constructor() {
            }
        }

    }

    export namespace Create {

        export class One implements Action {
            readonly type = EmployeeActionsEnum.CreateOne;

            constructor(public companyId: string,
                        public payload: EmployeeSaveResource) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = EmployeeActionsEnum.CreateOneFulfilled;

            constructor(public payload: EmployeeResource) {
            }
        }

        export class OneRejected implements Action {
            readonly type = EmployeeActionsEnum.CreateOneRejected;

            constructor() {
            }
        }

        export class OneReset implements Action {
            readonly type = EmployeeActionsEnum.CreateOneReset;

            constructor() {
            }
        }

    }

    export namespace Update {

        export class One implements Action {
            readonly type = EmployeeActionsEnum.UpdateOne;

            constructor(public employeeId: string,
                        public payload: EmployeeSaveResource,
                        public version: number) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = EmployeeActionsEnum.UpdateOneFulfilled;

            constructor(public payload: EmployeeResource) {
            }
        }

        export class OneRejected implements Action {
            readonly type = EmployeeActionsEnum.UpdateOneRejected;

            constructor() {
            }
        }

    }

    export namespace Set {
        export class Current implements Action {
            readonly type = EmployeeActionsEnum.SetCurrent;

            constructor(public payload: string) {
            }
        }

        export class Page implements Action {
            readonly type = EmployeeActionsEnum.SetPage;

            constructor(public payload: number) {
            }
        }

        export class Items implements Action {
            readonly type = EmployeeActionsEnum.SetPageSize;

            constructor(public payload: number) {
            }
        }

        export class Sort implements Action {
            readonly type = EmployeeActionsEnum.SetSort;

            constructor(public payload: SorterData) {
            }
        }
    }

    export namespace Delete {

        export class One implements Action {
            readonly type = EmployeeActionsEnum.DeleteOne;

            constructor(public id: string, public version: number) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = EmployeeActionsEnum.DeleteOneFulfilled;

            constructor(public employeeId: string) {
            }
        }

        export class OneRejected implements Action {
            readonly type = EmployeeActionsEnum.DeleteOneRejected;

            constructor() {
            }
        }

        export class OneReset implements Action {
            readonly type = EmployeeActionsEnum.DeleteOneReset;

            constructor() {
            }
        }
    }
}

export type EmployeeActions =
    EmployeeActions.Initialize.All |
    EmployeeActions.Initialize.Current |
    EmployeeActions.Create.One |
    EmployeeActions.Create.OneFulfilled |
    EmployeeActions.Create.OneRejected |
    EmployeeActions.Create.OneReset |
    EmployeeActions.Delete.One |
    EmployeeActions.Delete.OneFulfilled |
    EmployeeActions.Delete.OneRejected |
    EmployeeActions.Delete.OneReset |
    EmployeeActions.Set.Current |
    EmployeeActions.Set.Page |
    EmployeeActions.Set.Items |
    EmployeeActions.Set.Sort |
    EmployeeActions.Request.RequestPage |
    EmployeeActions.Request.RequestPageFulfilled |
    EmployeeActions.Request.RequestPageRejected |
    EmployeeActions.Request.One |
    EmployeeActions.Request.OneFulfilled |
    EmployeeActions.Request.OneRejected |
    EmployeeActions.Update.One |
    EmployeeActions.Update.OneFulfilled |
    EmployeeActions.Update.OneRejected;
