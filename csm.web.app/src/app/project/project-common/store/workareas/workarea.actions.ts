/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {SaveWorkareaResource} from '../../api/workareas/resources/save-workarea.resource';
import {WorkareaListResource} from '../../api/workareas/resources/workarea-list.resource';
import {WorkareaResource} from '../../api/workareas/resources/workarea.resource';

export enum WorkareaActionEnum {
    InitializeAll = '[Workareas] Initialize all',
    InitializeCurrent = '[Workareas] Initialize current',
    InitializeList = '[Workareas] Initialize list',
    CreateOne = '[Workareas] Create one',
    CreateOneFulfilled = '[Workareas] Create one fulfilled',
    CreateOneRejected = '[Workareas] Create one rejected',
    CreateOneReset = '[Workareas] Create one reset',
    DeleteOne = '[Workareas] Delete one',
    DeleteOneFulfilled = '[Workareas] Delete one fulfilled',
    DeleteOneRejected = '[Workareas] Delete one rejected',
    DeleteOneReset = '[Workareas] Delete one reset',
    UpdateOne = '[Workareas] Update one',
    UpdateOneFulfilled = '[Workareas] Update one fulfilled',
    UpdateOneRejected = '[Workareas] Update one rejected',
    UpdateOneReset = '[Workareas] Update one reset',
    UpdateList = '[Workareas] Update list',
    UpdateListFulfilled = '[Workareas] Update list fulfilled',
    UpdateListRejected = '[Workareas] Update list rejected',
    RequestAll = '[Workareas] Request all',
    RequestAllFulfilled = '[Workareas] Request all fulfilled',
    RequestAllRejected = '[Workareas] Request all rejected',
}

export namespace WorkareaActions {

    export namespace Initialize {
        export class All implements Action {
            readonly type = WorkareaActionEnum.InitializeAll;

            constructor() {
            }
        }

        export class Current implements Action {
            readonly type = WorkareaActionEnum.InitializeCurrent;

            constructor() {
            }
        }

        export class List implements Action {
            readonly type = WorkareaActionEnum.InitializeList;

            constructor() {
            }
        }
    }

    export namespace Create {
        export class One implements Action {
            readonly type = WorkareaActionEnum.CreateOne;

            constructor(public payload: SaveWorkareaResource) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = WorkareaActionEnum.CreateOneFulfilled;

            constructor(public payload: WorkareaListResource) {
            }
        }

        export class OneRejected implements Action {
            readonly type = WorkareaActionEnum.CreateOneRejected;

            constructor() {
            }
        }

        export class OneReset implements Action {
            readonly type = WorkareaActionEnum.CreateOneReset;

            constructor() {
            }
        }
    }

    export namespace Delete {
        export class One implements Action {
            readonly type = WorkareaActionEnum.DeleteOne;

            constructor(public payload: string) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = WorkareaActionEnum.DeleteOneFulfilled;

            constructor(public payload: WorkareaListResource) {
            }
        }

        export class OneRejected implements Action {
            readonly type = WorkareaActionEnum.DeleteOneRejected;

            constructor() {
            }
        }

        export class OneReset implements Action {
            readonly type = WorkareaActionEnum.DeleteOneReset;

            constructor() {
            }
        }
    }

    export namespace Request {
        export class All implements Action {
            readonly type = WorkareaActionEnum.RequestAll;

            constructor() {
            }
        }

        export class AllFulfilled implements Action {
            readonly type = WorkareaActionEnum.RequestAllFulfilled;

            constructor(public payload: WorkareaListResource) {
            }
        }

        export class AllRejected implements Action {
            readonly type = WorkareaActionEnum.RequestAllRejected;

            constructor() {
            }
        }
    }

    export namespace Update {
        export class One implements Action {
            readonly type = WorkareaActionEnum.UpdateOne;

            constructor(public payload: UpdateWorkareaPayload) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = WorkareaActionEnum.UpdateOneFulfilled;

            constructor(public payload: WorkareaResource) {
            }
        }

        export class OneRejected implements Action {
            readonly type = WorkareaActionEnum.UpdateOneRejected;

            constructor() {
            }
        }

        export class OneReset implements Action {
            readonly type = WorkareaActionEnum.UpdateOneReset;

            constructor() {
            }
        }

        export class List implements Action {
            readonly type = WorkareaActionEnum.UpdateList;

            constructor(public payload: UpdateWorkareaPayload) {
            }
        }

        export class ListFulfilled implements Action {
            readonly type = WorkareaActionEnum.UpdateListFulfilled;

            constructor(public payload: WorkareaListResource) {
            }
        }

        export class ListRejected implements Action {
            readonly type = WorkareaActionEnum.UpdateListRejected;

            constructor() {
            }
        }
    }
}

export interface UpdateWorkareaPayload {
    saveWorkarea: SaveWorkareaResource;
    workareaId: string;
}

export type WorkareaActions =
    WorkareaActions.Initialize.Current |
    WorkareaActions.Initialize.All |
    WorkareaActions.Initialize.List |
    WorkareaActions.Create.One |
    WorkareaActions.Create.OneFulfilled |
    WorkareaActions.Create.OneRejected |
    WorkareaActions.Create.OneReset |
    WorkareaActions.Delete.One |
    WorkareaActions.Delete.OneFulfilled |
    WorkareaActions.Delete.OneRejected |
    WorkareaActions.Delete.OneReset |
    WorkareaActions.Request.All |
    WorkareaActions.Request.AllFulfilled |
    WorkareaActions.Request.AllRejected |
    WorkareaActions.Update.One |
    WorkareaActions.Update.OneFulfilled |
    WorkareaActions.Update.OneRejected |
    WorkareaActions.Update.OneReset |
    WorkareaActions.Update.List |
    WorkareaActions.Update.ListFulfilled |
    WorkareaActions.Update.ListRejected;
