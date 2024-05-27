/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {SaveRfvResource} from '../../api/rfvs/resources/save-rfv.resource';
import {RfvEntity} from '../../entities/rfvs/rfv';

export enum RfvActionsEnum {
    InitializeAll = '[RFV] Initialize all',
    RequestAll = '[RFV] Request all',
    RequestAllFulfilled = '[RFV] Request all fulfilled',
    RequestAllRejected = '[RFV] Request all rejected',
    UpdateOne = '[RFV] Update one',
    UpdateOneFulfilled = '[RFV] Update one fulfilled',
    UpdateOneRejected = '[RFV] Update one rejected',
    UpdateOneReset = '[RFV] Update one reset',
    ActivateOne = '[RFV] Activate one',
    ActivateOneFulfilled = '[RFV] Activate one fulfilled',
    ActivateOneRejected = '[RFV] Activate one rejected',
    ActivateOneReset = '[RFV] Activate one reset',
    DeactivateOne = '[RFV] Deactivate one',
    DeactivateOneFulfilled = '[RFV] Deactivate one fulfilled',
    DeactivateOneRejected = '[RFV] Deactivate one rejected',
    DeactivateOneReset = '[RFV] Deactivate one reset',
}

export namespace RfvActions {
    export namespace Initialize {
        export class All implements Action {
            readonly type = RfvActionsEnum.InitializeAll;
        }
    }

    export namespace Request {
        export class All implements Action {
            readonly type = RfvActionsEnum.RequestAll;
        }

        export class AllFulfilled implements Action {
            readonly type = RfvActionsEnum.RequestAllFulfilled;

            constructor(public items: RfvEntity[]) {
            }
        }

        export class AllRejected implements Action {
            readonly type = RfvActionsEnum.RequestAllRejected;
        }
    }

    export namespace Update {
        export class One implements Action {
            readonly type = RfvActionsEnum.UpdateOne;

            constructor(public projectId: string,
                        public item: SaveRfvResource) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = RfvActionsEnum.UpdateOneFulfilled;

            constructor(public item: RfvEntity) {
            }
        }

        export class OneRejected implements Action {
            readonly type = RfvActionsEnum.UpdateOneRejected;

            constructor(public itemId: string) {
            }
        }

        export class OneReset implements Action {
            readonly type = RfvActionsEnum.UpdateOneReset;

            constructor(public itemId: string) {
            }
        }
    }

    export namespace Activate {
        export class One implements Action {
            readonly type = RfvActionsEnum.ActivateOne;

            constructor(public projectId: string,
                        public item: SaveRfvResource) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = RfvActionsEnum.ActivateOneFulfilled;

            constructor(public item: RfvEntity) {
            }
        }

        export class OneRejected implements Action {
            readonly type = RfvActionsEnum.ActivateOneRejected;

            constructor(public itemId: string) {
            }
        }

        export class OneReset implements Action {
            readonly type = RfvActionsEnum.ActivateOneReset;

            constructor(public itemId: string) {
            }
        }
    }

    export namespace Deactivate {
        export class One implements Action {
            readonly type = RfvActionsEnum.DeactivateOne;

            constructor(public projectId: string,
                        public item: SaveRfvResource) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = RfvActionsEnum.DeactivateOneFulfilled;

            constructor(public item: RfvEntity) {
            }
        }

        export class OneRejected implements Action {
            readonly type = RfvActionsEnum.DeactivateOneRejected;

            constructor(public itemId: string) {
            }
        }

        export class OneReset implements Action {
            readonly type = RfvActionsEnum.DeactivateOneReset;

            constructor(public itemId: string) {
            }
        }
    }
}

export type RfvActions =
    RfvActions.Initialize.All |
    RfvActions.Request.All |
    RfvActions.Request.AllFulfilled |
    RfvActions.Request.AllRejected |
    RfvActions.Update.One |
    RfvActions.Update.OneFulfilled |
    RfvActions.Update.OneRejected |
    RfvActions.Update.OneReset |
    RfvActions.Activate.One |
    RfvActions.Activate.OneFulfilled |
    RfvActions.Activate.OneRejected |
    RfvActions.Activate.OneReset |
    RfvActions.Deactivate.One |
    RfvActions.Deactivate.OneFulfilled |
    RfvActions.Deactivate.OneRejected |
    RfvActions.Deactivate.OneReset;
