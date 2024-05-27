/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {WeekDaysEnum} from '../../../../shared/misc/enums/weekDays.enum';
import {
    WorkDaysHoliday,
    WorkDaysResource
} from '../../api/work-days/resources/work-days.resource';

export enum WorkDaysActionEnum {
    InitializeAll = '[Work Days] Initialize all',
    RequestOne = '[Work Days] Request one',
    RequestOneFulfilled = '[Work Days] Request one fulfilled',
    RequestOneRejected = '[Work Days] Request one rejected',
    UpdateOne = '[Work Days] Update one',
    UpdateOneFulfilled = '[Work Days] Update one fulfilled',
    UpdateOneRejected = '[Work Days] Update one rejected',
}

export namespace WorkDaysActions {
    export namespace Initialize {
        export class All implements Action {
            public readonly type = WorkDaysActionEnum.InitializeAll;
        }
    }

    export namespace Request {
        export class One implements Action {
            public readonly type = WorkDaysActionEnum.RequestOne;
        }

        export class OneFulfilled implements Action {
            public readonly type = WorkDaysActionEnum.RequestOneFulfilled;

            constructor(public payload: WorkDaysResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = WorkDaysActionEnum.RequestOneRejected;
        }
    }

    export namespace Update {
        export class One implements Action {
            public readonly type = WorkDaysActionEnum.UpdateOne;

            constructor(public payload: UpdateWorkDaysPayload, public version: number) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = WorkDaysActionEnum.UpdateOneFulfilled;

            constructor(public payload: WorkDaysResource) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = WorkDaysActionEnum.UpdateOneRejected;
        }
    }
}

export interface UpdateWorkDaysPayload {
    allowWorkOnNonWorkingDays: boolean;
    holidays: WorkDaysHoliday[];
    startOfWeek: WeekDaysEnum ;
    workingDays: WeekDaysEnum[];
}

export type WorkDaysActions =
    WorkDaysActions.Initialize.All |
    WorkDaysActions.Request.One |
    WorkDaysActions.Request.OneFulfilled |
    WorkDaysActions.Request.OneRejected |
    WorkDaysActions.Update.One |
    WorkDaysActions.Update.OneFulfilled |
    WorkDaysActions.Update.OneRejected;
