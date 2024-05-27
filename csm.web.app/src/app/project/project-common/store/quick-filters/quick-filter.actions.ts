/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {QuickFilterResource} from '../../api/quick-filters/resources/quick-filter.resource';
import {QuickFilterListResource} from '../../api/quick-filters/resources/quick-filter-list.resource';
import {SaveQuickFilterResource} from '../../api/quick-filters/resources/save-quick-filter.resource';
import {QuickFilterId} from '../../models/quick-filters/quick-filter';
import {QuickFilterContext} from './quick-filter.slice';

export enum QuickFilterActionEnum {
    InitializeAll = '[Quick Filter] Initialize all',
    CreateOne = '[Quick Filter] Create one',
    CreateOneFulfilled = '[Quick Filter] Create one fulfilled',
    CreateOneRejected = '[Quick Filter] Create one rejected',
    CreateOneReset = '[Quick Filter] Create one reset',
    DeleteOne = '[Quick Filter] Delete one',
    DeleteOneFulfilled = '[Quick Filter] Delete one fulfilled',
    DeleteOneRejected = '[Quick Filter] Delete one rejected',
    DeleteOneReset = '[Quick Filter] Delete one reset',
    RequestAll = '[Quick Filter] Request all',
    RequestAllFulfilled = '[Quick Filter] Request all fulfilled',
    RequestAllRejected = '[Quick Filter] Request all rejected',
    SetAppliedFilter = '[Quick Filter] Set applied filter',
    UpdateOne = '[Quick Filter] Update one',
    UpdateOneFulfilled = '[Quick Filter] Update one fulfilled',
    UpdateOneRejected = '[Quick Filter] Update one rejected',
    UpdateOneReset = '[Quick Filter] Update one reset',
}

export namespace QuickFilterActions {
    export namespace Initialize {
        export class All implements Action {
            public readonly type = QuickFilterActionEnum.InitializeAll;
        }
    }

    export namespace Create {
        export class One implements Action {
            public readonly type = QuickFilterActionEnum.CreateOne;

            constructor(public item: SaveQuickFilterResource, public context: QuickFilterContext) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = QuickFilterActionEnum.CreateOneFulfilled;

            constructor(public item: QuickFilterResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = QuickFilterActionEnum.CreateOneRejected;
        }

        export class OneReset implements Action {
            public readonly type = QuickFilterActionEnum.CreateOneReset;
        }
    }

    export namespace Delete {
        export class One implements Action {
            public readonly type = QuickFilterActionEnum.DeleteOne;

            constructor(public itemId: string,
                        public version: number) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = QuickFilterActionEnum.DeleteOneFulfilled;

            constructor(public itemId: string) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = QuickFilterActionEnum.DeleteOneRejected;
        }

        export class OneReset implements Action {
            public readonly type = QuickFilterActionEnum.DeleteOneReset;
        }
    }

    export namespace Request {
        export class All implements Action {
            public readonly type = QuickFilterActionEnum.RequestAll;

            constructor() {
            }
        }

        export class AllFulfilled implements Action {
            public readonly type = QuickFilterActionEnum.RequestAllFulfilled;

            constructor(public list: QuickFilterListResource) {
            }
        }

        export class AllRejected implements Action {
            public readonly type = QuickFilterActionEnum.RequestAllRejected;
        }
    }

    export namespace Set {
        export class AppliedFilter implements Action {
            public readonly type = QuickFilterActionEnum.SetAppliedFilter;

            constructor(public filterId: QuickFilterId, public context: QuickFilterContext) {
            }
        }
    }

    export namespace Update {
        export class One implements Action {
            public readonly type = QuickFilterActionEnum.UpdateOne;

            constructor(public itemId: string, public item: SaveQuickFilterResource, public version: number) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = QuickFilterActionEnum.UpdateOneFulfilled;

            constructor(public item: QuickFilterResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = QuickFilterActionEnum.UpdateOneRejected;
        }

        export class OneReset implements Action {
            public readonly type = QuickFilterActionEnum.UpdateOneReset;
        }
    }
}

export type QuickFilterActions =
    QuickFilterActions.Initialize.All |
    QuickFilterActions.Create.One |
    QuickFilterActions.Create.OneFulfilled |
    QuickFilterActions.Create.OneRejected |
    QuickFilterActions.Create.OneReset |
    QuickFilterActions.Delete.One |
    QuickFilterActions.Delete.OneFulfilled |
    QuickFilterActions.Delete.OneRejected |
    QuickFilterActions.Delete.OneReset |
    QuickFilterActions.Request.All |
    QuickFilterActions.Request.AllFulfilled |
    QuickFilterActions.Request.AllRejected |
    QuickFilterActions.Set.AppliedFilter |
    QuickFilterActions.Update.One |
    QuickFilterActions.Update.OneFulfilled |
    QuickFilterActions.Update.OneRejected |
    QuickFilterActions.Update.OneReset;
