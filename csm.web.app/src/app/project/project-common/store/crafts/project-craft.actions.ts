/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {ProjectCraftResource} from '../../api/crafts/resources/project-craft.resource';
import {ProjectCraftListResource} from '../../api/crafts/resources/project-craft-list.resource';
import {SaveProjectCraftResource} from '../../api/crafts/resources/save-project-craft.resource';

export enum ProjectCraftsActionEnum {
    InitializeAll = '[Crafts] Initialize all',
    InitializeCurrent = '[Crafts] Initialize current',
    InitializeList = '[Crafts] Initialize list',
    CreateOne = '[Crafts] Create one',
    CreateOneFulfilled = '[Crafts] Create one fulfilled',
    CreateOneRejected = '[Crafts] Create one rejected',
    CreateOneReset = '[Crafts] Create one reset',
    DeleteOne = '[Crafts] Delete one',
    DeleteOneFulfilled = '[Crafts] Delete one fulfilled',
    DeleteOneRejected = '[Crafts] Delete one rejected',
    DeleteOneReset = '[Crafts] Delete one reset',
    UpdateOne = '[Crafts] Update one',
    UpdateOneFulfilled = '[Crafts] Update one fulfilled',
    UpdateOneRejected = '[Crafts] Update one rejected',
    UpdateOneReset = '[Crafts] Update one reset',
    UpdateList = '[Crafts] Update list',
    UpdateListFulfilled = '[Crafts] Update list fulfilled',
    UpdateListRejected = '[Crafts] Update list rejected',
    RequestAll = '[Crafts] Request all',
    RequestAllFulfilled = '[Crafts] Request all fulfilled',
    RequestAllRejected = '[Crafts] Request all rejected',
}

export namespace ProjectCraftActions {

    export namespace Initialize {
        export class All implements Action {
            public readonly type = ProjectCraftsActionEnum.InitializeAll;

            constructor() {
            }
        }

        export class Current implements Action {
            public readonly type = ProjectCraftsActionEnum.InitializeCurrent;

            constructor() {
            }
        }

        export class List implements Action {
            public readonly type = ProjectCraftsActionEnum.InitializeList;

            constructor() {
            }
        }
    }

    export namespace Create {
        export class One implements Action {
            public readonly type = ProjectCraftsActionEnum.CreateOne;

            constructor(public payload: SaveProjectCraftResource) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = ProjectCraftsActionEnum.CreateOneFulfilled;

            constructor(public payload: ProjectCraftListResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = ProjectCraftsActionEnum.CreateOneRejected;

            constructor() {
            }
        }

        export class OneReset implements Action {
            public readonly type = ProjectCraftsActionEnum.CreateOneReset;

            constructor() {
            }
        }
    }

    export namespace Delete {
        export class One implements Action {
            public readonly type = ProjectCraftsActionEnum.DeleteOne;

            constructor(public payload: string) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = ProjectCraftsActionEnum.DeleteOneFulfilled;

            constructor(public payload: ProjectCraftListResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = ProjectCraftsActionEnum.DeleteOneRejected;

            constructor() {
            }
        }

        export class OneReset implements Action {
            public readonly type = ProjectCraftsActionEnum.DeleteOneReset;

            constructor() {
            }
        }
    }

    export namespace Request {
        export class All implements Action {
            public readonly type = ProjectCraftsActionEnum.RequestAll;

            constructor() {
            }
        }

        export class AllFulfilled implements Action {
            public readonly type = ProjectCraftsActionEnum.RequestAllFulfilled;

            constructor(public payload: ProjectCraftListResource) {
            }
        }

        export class AllRejected implements Action {
            public readonly type = ProjectCraftsActionEnum.RequestAllRejected;

            constructor() {
            }
        }
    }

    export namespace Update {
        export class One implements Action {
            public readonly type = ProjectCraftsActionEnum.UpdateOne;

            constructor(public payload: UpdateProjectCraftPayload) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = ProjectCraftsActionEnum.UpdateOneFulfilled;

            constructor(public payload: ProjectCraftResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = ProjectCraftsActionEnum.UpdateOneRejected;

            constructor() {
            }
        }

        export class OneReset implements Action {
            public readonly type = ProjectCraftsActionEnum.UpdateOneReset;

            constructor() {
            }
        }

        export class List implements Action {
            public readonly type = ProjectCraftsActionEnum.UpdateList;

            constructor(public payload: UpdateProjectCraftPayload) {
            }
        }

        export class ListFulfilled implements Action {
            public readonly type = ProjectCraftsActionEnum.UpdateListFulfilled;

            constructor(public payload: ProjectCraftListResource) {
            }
        }

        export class ListRejected implements Action {
            public readonly type = ProjectCraftsActionEnum.UpdateListRejected;

            constructor() {
            }
        }
    }
}

export interface UpdateProjectCraftPayload {
    saveProjectCraft: SaveProjectCraftResource;
    projectCraftId: string;
    craftVersion: number;
}

export type ProjectCraftActions =
    ProjectCraftActions.Initialize.Current |
    ProjectCraftActions.Initialize.All |
    ProjectCraftActions.Initialize.List |
    ProjectCraftActions.Create.One |
    ProjectCraftActions.Create.OneFulfilled |
    ProjectCraftActions.Create.OneRejected |
    ProjectCraftActions.Create.OneReset |
    ProjectCraftActions.Delete.One |
    ProjectCraftActions.Delete.OneFulfilled |
    ProjectCraftActions.Delete.OneRejected |
    ProjectCraftActions.Delete.OneReset |
    ProjectCraftActions.Request.All |
    ProjectCraftActions.Request.AllFulfilled |
    ProjectCraftActions.Request.AllRejected |
    ProjectCraftActions.Update.One |
    ProjectCraftActions.Update.OneFulfilled |
    ProjectCraftActions.Update.OneRejected |
    ProjectCraftActions.Update.OneReset |
    ProjectCraftActions.Update.List |
    ProjectCraftActions.Update.ListFulfilled |
    ProjectCraftActions.Update.ListRejected;
