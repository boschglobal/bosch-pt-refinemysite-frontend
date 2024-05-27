/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */
import {Action} from '@ngrx/store';

import {RescheduleResource} from '../../api/reschedule/resources/reschedule.resource';
import {SaveRescheduleResource} from '../../api/reschedule/resources/save-reschedule.resource';

export enum RescheduleActionEnum {
    InitializeAll = '[Reschedule] Initialize All',
    RescheduleOne = '[Reschedule] Reschedule One',
    RescheduleOneFulfilled = '[Reschedule] Reschedule One Fulfilled',
    RescheduleOneRejected = '[Reschedule] Reschedule One Rejected',
    ValidateOne = '[Reschedule] Validate One',
    ValidateOneFulfilled = '[Reschedule] Validate One Fulfilled',
    ValidateOneRejected = '[Reschedule] Validate One Rejected',
}

export namespace RescheduleActions {
    export namespace Initialize {
        export class All implements Action {
            public readonly type = RescheduleActionEnum.InitializeAll;
        }
    }

    export namespace Validate {
        export class One implements Action {
            public readonly type = RescheduleActionEnum.ValidateOne;

            constructor(public item: SaveRescheduleResource) {}
        }

        export class OneFulfilled implements Action {
            public readonly type = RescheduleActionEnum.ValidateOneFulfilled;

            constructor(public item: RescheduleResource) {}
        }

        export class OneRejected implements Action {
            public readonly type = RescheduleActionEnum.ValidateOneRejected;
        }
    }

    export namespace Reschedule {
        export class One implements Action {
            public readonly type = RescheduleActionEnum.RescheduleOne;

            constructor(public item: SaveRescheduleResource) {}
        }

        export class OneFulfilled implements Action {
            public readonly type = RescheduleActionEnum.RescheduleOneFulfilled;

            constructor(public id: string) {}
        }

        export class OneRejected implements Action {
            public readonly type = RescheduleActionEnum.RescheduleOneRejected;
        }
    }
}

export type RescheduleActions =
    RescheduleActions.Initialize.All |
    RescheduleActions.Validate.One |
    RescheduleActions.Validate.OneFulfilled |
    RescheduleActions.Validate.OneRejected |
    RescheduleActions.Reschedule.One |
    RescheduleActions.Reschedule.OneFulfilled |
    RescheduleActions.Reschedule.OneRejected;
