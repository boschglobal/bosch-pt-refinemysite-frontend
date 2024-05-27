/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {EmployableUserFilter} from '../../api/resources/employable-user-filter.resource';
import {EmployableUserListResource} from '../../api/resources/employable-user-list.resource';
import {SorterData} from '../../../shared/ui/sorter/sorter-data.datastructure';

export enum EmployableUserActionEnum {
    RequestPage = '[EmployableUser] Request employable user list page',
    RequestPageFulfilled = '[EmployableUser] Request employable user list page fulfilled',
    RequestPageRejected = '[EmployableUser] Request employable user list page rejected',
    InitializeCurrent = '[EmployableUser] Initialize current',
    InitializeFilter = '[EmployableUser] Initialize filter',
    SetPage = '[EmployableUser] Set page',
    SetPageSize = '[EmployableUser] Set items',
    SetSort = '[EmployableUser] Set sort',
    SetFilter = '[EmployableUser] Set filter',
    SetCurrent = '[EmployableUser] Set current'
}

export namespace EmployableUserActions {

    export namespace Request {

        export class Page implements Action {
            readonly type = EmployableUserActionEnum.RequestPage;

            constructor() {
            }
        }

        export class PageFulfilled implements Action {
            readonly type = EmployableUserActionEnum.RequestPageFulfilled;

            constructor(public payload: EmployableUserListResource) {
            }
        }

        export class PageRejected implements Action {
            readonly type = EmployableUserActionEnum.RequestPageRejected;

            constructor() {
            }
        }
    }

    export namespace Initialize {

        export class Current implements Action {
            readonly type = EmployableUserActionEnum.InitializeCurrent;

            constructor() {
            }
        }

        export class Filter implements Action {
            readonly type = EmployableUserActionEnum.InitializeFilter;

            constructor() {
            }
        }
     }

    export namespace Set {

        export class Current implements Action {
            readonly type = EmployableUserActionEnum.SetCurrent;

            constructor(public payload: string) {
            }
        }

        export class Page implements Action {
            readonly type = EmployableUserActionEnum.SetPage;

            constructor(public payload: number) {
            }
        }

        export class PageSize implements Action {
            readonly type = EmployableUserActionEnum.SetPageSize;

            constructor(public payload: number) {
            }
        }

        export class Sort implements Action {
            readonly type = EmployableUserActionEnum.SetSort;

            constructor(public payload: SorterData) {
            }
        }

        export class Filter implements Action {
            readonly type = EmployableUserActionEnum.SetFilter;

            constructor(public payload: EmployableUserFilter) {
            }
        }
    }
}

export type EmployableUserActions =
    EmployableUserActions.Request.Page |
    EmployableUserActions.Request.PageFulfilled |
    EmployableUserActions.Request.PageRejected |
    EmployableUserActions.Initialize.Current |
    EmployableUserActions.Initialize.Filter |
    EmployableUserActions.Set.Current |
    EmployableUserActions.Set.Page |
    EmployableUserActions.Set.PageSize |
    EmployableUserActions.Set.Sort |
    EmployableUserActions.Set.Filter;
