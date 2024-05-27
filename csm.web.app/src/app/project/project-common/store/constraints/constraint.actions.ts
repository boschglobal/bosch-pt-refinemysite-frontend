/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {SaveConstraintResource} from '../../api/constraints/resources/save-constraint.resource';
import {ConstraintEntity} from '../../entities/constraints/constraint';

export enum ConstraintActionEnum {
    InitializeAll = '[Constraint] Initialize all',
    RequestAll = '[Constraint] Request all',
    RequestAllFulfilled = '[Constraint] Request all fulfilled',
    RequestAllRejected = '[Constraint] Request all rejected',
    UpdateOne = '[Constraint] Update one',
    UpdateOneFulfilled = '[Constraint] Update one fulfilled',
    UpdateOneRejected = '[Constraint] Update one rejected',
    UpdateOneReset = '[Constraint] Update one reset',
    ActivateOne = '[Constraint] Activate one',
    ActivateOneFulfilled = '[Constraint] Activate one fulfilled',
    ActivateOneRejected = '[Constraint] Activate one rejected',
    ActivateOneReset = '[Constraint] Activate one reset',
    DeactivateOne = '[Constraint] Deactivate one',
    DeactivateOneFulfilled = '[Constraint] Deactivate one fulfilled',
    DeactivateOneRejected = '[Constraint] Deactivate one rejected',
    DeactivateOneReset = '[Constraint] Deactivate one reset',
}

export namespace ConstraintActions {
    export namespace Initialize {
        export class All implements Action {
            readonly type = ConstraintActionEnum.InitializeAll;
        }
    }

    export namespace Request {
        export class All implements Action {
            readonly type = ConstraintActionEnum.RequestAll;
        }

        export class AllFulfilled implements Action {
            readonly type = ConstraintActionEnum.RequestAllFulfilled;

            constructor(public items: ConstraintEntity[]) {
            }
        }

        export class AllRejected implements Action {
            readonly type = ConstraintActionEnum.RequestAllRejected;
        }
    }

    export namespace Update {
        export class One implements Action {
            readonly type = ConstraintActionEnum.UpdateOne;

            constructor(public item: SaveConstraintResource) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = ConstraintActionEnum.UpdateOneFulfilled;

            constructor(public item: ConstraintEntity) {
            }
        }

        export class OneRejected implements Action {
            readonly type = ConstraintActionEnum.UpdateOneRejected;

            constructor(public itemId: string) {
            }
        }

        export class OneReset implements Action {
            readonly type = ConstraintActionEnum.UpdateOneReset;

            constructor(public itemId: string) {
            }
        }
    }

    export namespace Activate {
        export class One implements Action {
            readonly type = ConstraintActionEnum.ActivateOne;

            constructor(public item: SaveConstraintResource) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = ConstraintActionEnum.ActivateOneFulfilled;

            constructor(public item: ConstraintEntity) {
            }
        }

        export class OneRejected implements Action {
            readonly type = ConstraintActionEnum.ActivateOneRejected;

            constructor(public itemId: string) {
            }
        }

        export class OneReset implements Action {
            readonly type = ConstraintActionEnum.ActivateOneReset;

            constructor(public itemId: string) {
            }
        }
    }

    export namespace Deactivate {
        export class One implements Action {
            readonly type = ConstraintActionEnum.DeactivateOne;

            constructor(public item: SaveConstraintResource) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = ConstraintActionEnum.DeactivateOneFulfilled;

            constructor(public item: ConstraintEntity) {
            }
        }

        export class OneRejected implements Action {
            readonly type = ConstraintActionEnum.DeactivateOneRejected;

            constructor(public itemId: string) {
            }
        }

        export class OneReset implements Action {
            readonly type = ConstraintActionEnum.DeactivateOneReset;

            constructor(public itemId: string) {
            }
        }
    }
}

export type ConstraintActions =
    ConstraintActions.Initialize.All |
    ConstraintActions.Request.All |
    ConstraintActions.Request.AllFulfilled |
    ConstraintActions.Request.AllRejected |
    ConstraintActions.Update.One |
    ConstraintActions.Update.OneFulfilled |
    ConstraintActions.Update.OneRejected |
    ConstraintActions.Update.OneReset |
    ConstraintActions.Activate.One |
    ConstraintActions.Activate.OneFulfilled |
    ConstraintActions.Activate.OneRejected |
    ConstraintActions.Activate.OneReset |
    ConstraintActions.Deactivate.One |
    ConstraintActions.Deactivate.OneFulfilled |
    ConstraintActions.Deactivate.OneRejected |
    ConstraintActions.Deactivate.OneReset;
