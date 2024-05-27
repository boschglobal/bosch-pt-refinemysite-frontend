/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {CompanyFilterData} from '../api/resources/company-filter.resource';
import {CompanyListResource} from '../api/resources/company-list.resource';
import {CompanySuggestionsResource} from '../api/resources/company-suggestions.resource';
import {CompanyResource} from '../api/resources/company.resource';
import {CompanySaveResource} from '../api/resources/company-save.resource';
import {SorterData} from '../../../shared/ui/sorter/sorter-data.datastructure';

export enum CompanyActionsEnum {
    CreateOne = '[Company] Create one',
    CreateOneFulfilled = '[Company] Create one fulfilled',
    CreateOneRejected = '[Company] Create one rejected',
    CreateOneReset = '[Company] Create one reset',
    DeleteOne = '[Company] Delete company',
    DeleteOneFulfilled = '[Company] Delete company fulfilled',
    DeleteOneRejected = '[Company] Delete company rejected',
    DeleteOneReset = '[Company] Delete one reset',
    InitializeAll = '[Company] Initialize all',
    InitializeCurrent = '[Company] Initialize current',
    InitializeFilter = '[Company] Initialize filter',
    RequestOne = '[Company] Request company',
    RequestOneFulfilled = '[Company] Request company fulfilled',
    RequestOneRejected = '[Company] Request company rejected',
    RequestPage = '[Company] Request company list page',
    RequestPageFulfilled = '[Company] Request company list page fulfilled',
    RequestPageRejected = '[Company] Request company list page rejected',
    RequestSuggestions = '[Company] Request company suggestions',
    RequestSuggestionsFulfilled = '[Company] Request companies suggestions fulfilled',
    SetCurrent = '[Company] Set current',
    SetPage = '[Company] Set page',
    SetPageSize = '[Company] Set page size',
    SetSort = '[Company] Set sort',
    SetFilter = '[Company] Set filter',
    UpdateOne = '[Company] Update company',
    UpdateOneFulfilled = '[Company] Update company fulfilled',
    UpdateOneRejected = '[Company] Update company rejected',
    UpdateOneReset = '[Company] Update one reset',
}

export namespace CompanyActions {

    export namespace Initialize {
        export class All implements Action {
            readonly type = CompanyActionsEnum.InitializeAll;

            constructor() {
            }
        }

        export class Current implements Action {
            readonly type = CompanyActionsEnum.InitializeCurrent;

            constructor() {
            }
        }

        export class Filter implements Action {
            readonly type = CompanyActionsEnum.InitializeFilter;

            constructor() {
            }
        }
    }

    export namespace Request {
        export class RequestOne implements Action {
            readonly type = CompanyActionsEnum.RequestOne;

            constructor(public id: string) {
            }
        }

        export class RequestOneFulfilled implements Action {
            readonly type = CompanyActionsEnum.RequestOneFulfilled;

            constructor(public payload: CompanyResource) {
            }
        }

        export class RequestOneRejected implements Action {
            readonly type = CompanyActionsEnum.RequestOneRejected;

            constructor() {
            }
        }

        export class Page implements Action {
            readonly type = CompanyActionsEnum.RequestPage;

            constructor() {
            }
        }

        export class PageFulfilled implements Action {
            readonly type = CompanyActionsEnum.RequestPageFulfilled;

            constructor(public payload: CompanyListResource) {
            }
        }

        export class PageRejected implements Action {
            readonly type = CompanyActionsEnum.RequestPageRejected;

            constructor() {
            }
        }

        export class RequestSuggestions implements Action {
            readonly type = CompanyActionsEnum.RequestSuggestions;

            constructor(public payload: string) {
            }
        }

        export class RequestSuggestionsFulfilled implements Action {
            readonly type = CompanyActionsEnum.RequestSuggestionsFulfilled;

            constructor(public payload: CompanySuggestionsResource) {
            }
        }
    }

    export namespace Create {

        export class One implements Action {
            readonly type = CompanyActionsEnum.CreateOne;

            constructor(public payload: CompanySaveResource) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = CompanyActionsEnum.CreateOneFulfilled;

            constructor(public payload: CompanyResource) {
            }
        }

        export class OneRejected implements Action {
            readonly type = CompanyActionsEnum.CreateOneRejected;

            constructor() {
            }
        }

        export class OneReset implements Action {
            readonly type = CompanyActionsEnum.CreateOneReset;

            constructor() {
            }
        }

    }

    export namespace Update {

        export class One implements Action {
            readonly type = CompanyActionsEnum.UpdateOne;

            constructor(public companyId: string,
                        public payload: CompanySaveResource,
                        public version: number) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = CompanyActionsEnum.UpdateOneFulfilled;

            constructor(public payload: CompanyResource) {
            }
        }

        export class OneRejected implements Action {
            readonly type = CompanyActionsEnum.UpdateOneRejected;

            constructor() {
            }
        }

        export class OneReset implements Action {
            readonly type = CompanyActionsEnum.UpdateOneReset;

            constructor() {
            }
        }
    }

    export namespace Set {
        export class Current implements Action {
            readonly type = CompanyActionsEnum.SetCurrent;

            constructor(public payload: string) {
            }
        }

        export class Page implements Action {
            readonly type = CompanyActionsEnum.SetPage;

            constructor(public payload: number) {
            }
        }

        export class PageSize implements Action {
            readonly type = CompanyActionsEnum.SetPageSize;

            constructor(public payload: number) {
            }
        }

        export class Sort implements Action {
            readonly type = CompanyActionsEnum.SetSort;

            constructor(public payload: SorterData) {
            }
        }

        export class Filter implements Action {
            readonly type = CompanyActionsEnum.SetFilter;

            constructor(public payload: CompanyFilterData) {
            }
        }
    }

    export namespace Delete {

        export class One implements Action {
            readonly type = CompanyActionsEnum.DeleteOne;

            constructor(public id: string, public version: number) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = CompanyActionsEnum.DeleteOneFulfilled;

            constructor(public id: string) {
            }
        }

        export class OneRejected implements Action {
            readonly type = CompanyActionsEnum.DeleteOneRejected;

            constructor() {
            }
        }

        export class OneReset implements Action {
            readonly type = CompanyActionsEnum.DeleteOneReset;

            constructor() {
            }
        }
    }
}

export type CompanyActions =
    CompanyActions.Create.One |
    CompanyActions.Create.OneFulfilled |
    CompanyActions.Create.OneRejected |
    CompanyActions.Create.OneReset |
    CompanyActions.Delete.One |
    CompanyActions.Delete.OneFulfilled |
    CompanyActions.Delete.OneRejected |
    CompanyActions.Delete.OneReset |
    CompanyActions.Initialize.All |
    CompanyActions.Initialize.Current |
    CompanyActions.Initialize.Filter |
    CompanyActions.Request.RequestOne |
    CompanyActions.Request.RequestOneFulfilled |
    CompanyActions.Request.RequestOneRejected |
    CompanyActions.Request.Page |
    CompanyActions.Request.PageFulfilled |
    CompanyActions.Request.PageRejected |
    CompanyActions.Request.RequestSuggestions |
    CompanyActions.Request.RequestSuggestionsFulfilled |
    CompanyActions.Set.Current |
    CompanyActions.Set.Page |
    CompanyActions.Set.PageSize |
    CompanyActions.Set.Sort |
    CompanyActions.Set.Filter |
    CompanyActions.Update.One |
    CompanyActions.Update.OneFulfilled |
    CompanyActions.Update.OneRejected |
    CompanyActions.Update.OneReset;
