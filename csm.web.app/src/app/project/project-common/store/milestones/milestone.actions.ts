/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {MilestoneResource} from '../../api/milestones/resources/milestone.resource';
import {MilestoneListResource} from '../../api/milestones/resources/milestone-list.resource';
import {SaveMilestoneResource} from '../../api/milestones/resources/save-milestone.resource';
import {MilestoneFilters} from './slice/milestone-filters';

export enum MilestoneActionEnum {
    InitializeAll = '[Milestone] Initialize all',
    InitializeList = '[Milestone] Initialize items',
    CreateOne = '[Milestone] Create one',
    CreateOneFulfilled = '[Milestone] Create one fulfilled',
    CreateOneRejected = '[Milestone] Create one rejected',
    CreateOneReset = '[Milestone] Create one reset',
    DeleteOne = '[Milestone] Delete one',
    DeleteOneFulfilled = '[Milestone] Delete one fulfilled',
    DeleteOneRejected = '[Milestone] Delete one rejected',
    DeleteOneReset = '[Milestone] Delete one reset',
    RequestAll = '[Milestone] Request all',
    RequestAllFulfilled = '[Milestone] Request all fulfilled',
    RequestAllRejected = '[Milestone] Request all rejected',
    RequestAllByIds = '[Milestone] Request all by ids',
    RequestAllByIdsFulfilled = '[Milestone] Request all by ids fulfilled',
    RequestAllByIdsRejected = '[Milestone] Request all by ids rejected',
    RequestAllByMilestoneListIds = '[Milestone] Request all by milestone list ids',
    RequestAllByMilestoneListIdsFulfilled = '[Milestone] Request all by milestone list ids fulfilled',
    RequestAllByMilestoneListIdsRejected = '[Milestone] Request all by milestone list ids rejected',
    RequestOne = '[Milestone] Request one',
    RequestOneFulfilled = '[Milestone] Request one fulfilled',
    RequestOneRejected = '[Milestone] Request one rejected',
    SetFilters = '[Milestone] Set filters',
    UpdateOne = '[Milestone] Update one',
    UpdateOneFulfilled = '[Milestone] Update one fulfilled',
    UpdateOneRejected = '[Milestone] Update one rejected',
    UpdateOneReset = '[Milestone] Update one reset',
}

export namespace MilestoneActions {
    export namespace Initialize {
        export class All implements Action {
            public readonly type = MilestoneActionEnum.InitializeAll;
        }

        export class List implements Action {
            public readonly type = MilestoneActionEnum.InitializeList;
        }
    }

    export namespace Create {
        export class One implements Action {
            public readonly type = MilestoneActionEnum.CreateOne;

            constructor(public item: SaveMilestoneResource) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = MilestoneActionEnum.CreateOneFulfilled;

            constructor(public item: MilestoneResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = MilestoneActionEnum.CreateOneRejected;
        }

        export class OneReset implements Action {
            public readonly type = MilestoneActionEnum.CreateOneReset;
        }
    }

    export namespace Delete {
        export class One implements Action {
            public readonly type = MilestoneActionEnum.DeleteOne;

            constructor(public itemId: string,
                        public version: number) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = MilestoneActionEnum.DeleteOneFulfilled;

            constructor(public itemId: string) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = MilestoneActionEnum.DeleteOneRejected;
        }

        export class OneReset implements Action {
            public readonly type = MilestoneActionEnum.DeleteOneReset;
        }
    }

    export namespace Request {
        export class One implements Action {
            public readonly type = MilestoneActionEnum.RequestOne;

            constructor(public itemId: string) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = MilestoneActionEnum.RequestOneFulfilled;

            constructor(public item: MilestoneResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = MilestoneActionEnum.RequestOneRejected;
        }

        export class All implements Action {
            public readonly type = MilestoneActionEnum.RequestAll;

            constructor() {
            }
        }

        export class AllFulfilled implements Action {
            public readonly type = MilestoneActionEnum.RequestAllFulfilled;

            constructor(public list: MilestoneListResource) {
            }
        }

        export class AllRejected implements Action {
            public readonly type = MilestoneActionEnum.RequestAllRejected;
        }

        export class AllByIds implements Action {
            public readonly type = MilestoneActionEnum.RequestAllByIds;

            constructor(public ids: string[]) {
            }
        }

        export class AllByIdsFulfilled implements Action {
            public readonly type = MilestoneActionEnum.RequestAllByIdsFulfilled;

            constructor(public payload: MilestoneResource[]) {
            }
        }

        export class AllByIdsRejected implements Action {
            public readonly type = MilestoneActionEnum.RequestAllByIdsRejected;
        }

        export class AllByMilestoneListIds implements Action {
            public readonly type = MilestoneActionEnum.RequestAllByMilestoneListIds;

            constructor(public milestoneListIds: string[]) {
            }
        }

        export class AllByMilestoneListIdsFulfilled implements Action {
            public readonly type = MilestoneActionEnum.RequestAllByMilestoneListIdsFulfilled;

            constructor(public payload: MilestoneResource[]) {
            }
        }

        export class AllByMilestoneListIdsRejected implements Action {
            public readonly type = MilestoneActionEnum.RequestAllByMilestoneListIdsRejected;
        }
    }

    export namespace Set {
        export class Filters implements Action {
            public readonly type = MilestoneActionEnum.SetFilters;

            constructor(public payload: MilestoneFilters) {
            }
        }
    }

    export namespace Update {
        export class One implements Action {
            public readonly type = MilestoneActionEnum.UpdateOne;

            constructor(public itemId: string,
                        public item: SaveMilestoneResource,
                        public version: number) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = MilestoneActionEnum.UpdateOneFulfilled;

            constructor(public item: MilestoneResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = MilestoneActionEnum.UpdateOneRejected;
        }

        export class OneReset implements Action {
            public readonly type = MilestoneActionEnum.UpdateOneReset;
        }
    }
}

export type MilestoneActions =
    MilestoneActions.Initialize.All |
    MilestoneActions.Initialize.List |
    MilestoneActions.Create.One |
    MilestoneActions.Create.OneFulfilled |
    MilestoneActions.Create.OneRejected |
    MilestoneActions.Create.OneReset |
    MilestoneActions.Delete.One |
    MilestoneActions.Delete.OneFulfilled |
    MilestoneActions.Delete.OneRejected |
    MilestoneActions.Delete.OneReset |
    MilestoneActions.Request.One |
    MilestoneActions.Request.OneFulfilled |
    MilestoneActions.Request.OneRejected |
    MilestoneActions.Request.All |
    MilestoneActions.Request.AllFulfilled |
    MilestoneActions.Request.AllRejected |
    MilestoneActions.Request.AllByIds |
    MilestoneActions.Request.AllByIdsFulfilled |
    MilestoneActions.Request.AllByIdsRejected |
    MilestoneActions.Request.AllByMilestoneListIds |
    MilestoneActions.Request.AllByMilestoneListIdsFulfilled |
    MilestoneActions.Request.AllByMilestoneListIdsRejected |
    MilestoneActions.Set.Filters |
    MilestoneActions.Update.One |
    MilestoneActions.Update.OneFulfilled |
    MilestoneActions.Update.OneRejected |
    MilestoneActions.Update.OneReset;
