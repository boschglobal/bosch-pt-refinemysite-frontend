/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {PATResource} from '../../../project/project-common/api/pats/resources/pat.resource';
import {PATListResource} from '../../../project/project-common/api/pats/resources/pat-list.resource';
import {SavePATResource} from '../../../project/project-common/api/pats/resources/save-pat.resource';

export enum PATActionEnum {
    InitializeAll = '[PATs] Initialize all',
    InitializeCurrent = '[PATs] Initialize current',
    InitializeList = '[PATs] Initialize list',
    CreateOne = '[PATs] Create one',
    CreateOneFulfilled = '[PATs] Create one fulfilled',
    CreateOneRejected = '[PATs] Create one rejected',
    DeleteOne = '[PATs] Delete one',
    DeleteOneFulfilled = '[PATs] Delete one fulfilled',
    DeleteOneRejected = '[PATs] Delete one rejected',
    UpdateOne = '[PATs] Update one',
    UpdateOneFulfilled = '[PATs] Update one fulfilled',
    UpdateOneRejected = '[PATs] Update one rejected',
    RequestAll = '[PATs] Request all',
    RequestAllFulfilled = '[PATs] Request all fulfilled',
    RequestAllRejected = '[PATs] Request all rejected',
}

export namespace PATActions {

    export namespace Initialize {
        export class All implements Action {
            public readonly type = PATActionEnum.InitializeAll;
        }

        export class Current implements Action {
            public readonly type = PATActionEnum.InitializeCurrent;
        }

        export class List implements Action {
            public readonly type = PATActionEnum.InitializeList;
        }
    }

    export namespace Create {
        export class One implements Action {
            public readonly type = PATActionEnum.CreateOne;

            constructor(public payload: SavePATResource) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = PATActionEnum.CreateOneFulfilled;

            constructor(public payload: PATResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = PATActionEnum.CreateOneRejected;
        }
    }

    export namespace Delete {
        export class One implements Action {
            public readonly type = PATActionEnum.DeleteOne;

            constructor(public payload: string) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = PATActionEnum.DeleteOneFulfilled;

            constructor(public payload: string) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = PATActionEnum.DeleteOneRejected;
        }
    }

    export namespace Request {
        export class All implements Action {
            public readonly type = PATActionEnum.RequestAll;
        }

        export class AllFulfilled implements Action {
            public readonly type = PATActionEnum.RequestAllFulfilled;

            constructor(public payload: PATListResource) {
            }
        }

        export class AllRejected implements Action {
            public readonly type = PATActionEnum.RequestAllRejected;
        }
    }

    export namespace Update {
        export class One implements Action {
            public readonly type = PATActionEnum.UpdateOne;

            constructor(public payload: UpdatePATPayload) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = PATActionEnum.UpdateOneFulfilled;

            constructor(public payload: PATResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = PATActionEnum.UpdateOneRejected;
        }
    }
}

export interface UpdatePATPayload {
    savePATResource: SavePATResource;
    patId: string;
    version: number;
}

export type PATActions =
    PATActions.Initialize.Current |
    PATActions.Initialize.All |
    PATActions.Initialize.List |
    PATActions.Create.One |
    PATActions.Create.OneFulfilled |
    PATActions.Create.OneRejected |
    PATActions.Delete.One |
    PATActions.Delete.OneFulfilled |
    PATActions.Delete.OneRejected |
    PATActions.Request.All |
    PATActions.Request.AllFulfilled |
    PATActions.Request.AllRejected |
    PATActions.Update.One |
    PATActions.Update.OneFulfilled |
    PATActions.Update.OneRejected;
