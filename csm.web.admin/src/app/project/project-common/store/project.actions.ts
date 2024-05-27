/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {SorterData} from '../../../shared/ui/sorter/sorter-data.datastructure';
import {ProjectDeleteResource} from '../api/resources/project-delete.resource';
import {ProjectFiltersResource} from '../api/resources/project-filters.resource';
import {ProjectListResource} from '../api/resources/project-list.resource';
import {ProjectResource} from '../api/resources/project.resource';

export enum ProjectActionsEnum {
    InitializeAll = '[Project] Initialize all',
    InitializeCurrent = '[Project] Initialize current',
    InitializeFilters = '[Project] Initialize filters',
    DeleteOne = '[Project] Delete one',
    DeleteOneFulfilled = '[Project] Delete one fulfilled',
    DeleteOneRejected = '[Project] Delete one rejected',
    DeleteOneReset = '[Project] Delete one reset',
    RequestOne = '[Project] Request one',
    RequestOneFulfilled = '[Project] Request one fulfilled',
    RequestOneRejected = '[Project] Request one rejected',
    RequestPage = '[Project] Request page',
    RequestPageFulfilled = '[Project] Request page fulfilled',
    RequestPageRejected = '[Project] Request page rejected',
    SetCurrent = '[Project] Set current',
    SetFilters = '[Project] Set filters',
    SetPage = '[Project] Set page',
    SetPageSize = '[Project] Set page size',
    SetSort = '[Project] Set sort',
}

export namespace ProjectActions {

    export namespace Initialize {

        export class All implements Action {
            readonly type = ProjectActionsEnum.InitializeAll;

            constructor() {
            }
        }

        export class Current implements Action {
            readonly type = ProjectActionsEnum.InitializeCurrent;

            constructor() {
            }
        }

        export class Filters implements Action {
            readonly type = ProjectActionsEnum.InitializeFilters;

            constructor() {
            }
        }
    }

    export namespace Delete {

        export class One implements Action {
            readonly type = ProjectActionsEnum.DeleteOne;

            constructor(public id: string, public projectDeleteResource: ProjectDeleteResource) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = ProjectActionsEnum.DeleteOneFulfilled;

            constructor(public id: string) {
            }
        }

        export class OneRejected implements Action {
            readonly type = ProjectActionsEnum.DeleteOneRejected;

            constructor() {
            }
        }

        export class OneReset implements Action {
            readonly type = ProjectActionsEnum.DeleteOneReset;

            constructor() {
            }
        }
    }

    export namespace Request {

        export class One implements Action {
            readonly type = ProjectActionsEnum.RequestOne;

            constructor(public id: string) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = ProjectActionsEnum.RequestOneFulfilled;

            constructor(public payload: ProjectResource) {
            }
        }

        export class OneRejected implements Action {
            readonly type = ProjectActionsEnum.RequestOneRejected;

            constructor() {
            }
        }

        export class Page implements Action {
            readonly type = ProjectActionsEnum.RequestPage;

            constructor() {
            }
        }

        export class PageFulfilled implements Action {
            readonly type = ProjectActionsEnum.RequestPageFulfilled;

            constructor(public payload: ProjectListResource) {
            }
        }

        export class PageRejected implements Action {
            readonly type = ProjectActionsEnum.RequestPageRejected;

            constructor() {
            }
        }
    }

    export namespace Set {

        export class Current implements Action {
            readonly type = ProjectActionsEnum.SetCurrent;

            constructor(public payload: string) {
            }
        }

        export class Page implements Action {
            readonly type = ProjectActionsEnum.SetPage;

            constructor(public payload: number) {
            }
        }

        export class PageSize implements Action {
            readonly type = ProjectActionsEnum.SetPageSize;

            constructor(public payload: number) {
            }
        }

        export class Sort implements Action {
            readonly type = ProjectActionsEnum.SetSort;

            constructor(public payload: SorterData) {
            }
        }

        export class Filters implements Action {
            readonly type = ProjectActionsEnum.SetFilters;

            constructor(public payload: ProjectFiltersResource) {
            }
        }
    }
}

export type ProjectActions =
    ProjectActions.Initialize.All |
    ProjectActions.Initialize.Current |
    ProjectActions.Initialize.Filters |
    ProjectActions.Delete.One |
    ProjectActions.Delete.OneFulfilled |
    ProjectActions.Delete.OneRejected |
    ProjectActions.Delete.OneReset |
    ProjectActions.Request.One |
    ProjectActions.Request.OneFulfilled |
    ProjectActions.Request.OneRejected |
    ProjectActions.Request.Page |
    ProjectActions.Request.PageFulfilled |
    ProjectActions.Request.PageRejected |
    ProjectActions.Set.Current |
    ProjectActions.Set.Page |
    ProjectActions.Set.PageSize |
    ProjectActions.Set.Sort |
    ProjectActions.Set.Filters;
