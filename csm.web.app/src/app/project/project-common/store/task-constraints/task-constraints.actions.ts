/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {SaveTaskConstraintsResource} from '../../api/task-constraints/resources/save-task-constraints.resource';
import {TaskConstraintsResource} from '../../api/task-constraints/resources/task-constraints.resource';

export enum TaskConstraintsActionEnum {
    InitializeAll = '[Task Constraints] Initialize all',
    RequestOne = '[Task Constraints] Request one',
    RequestOneFulfilled = '[Task Constraints] Request one fulfilled',
    RequestOneRejected = '[Task Constraints] Request one rejected',
    UpdateOne = '[Task Constraints] Update one',
    UpdateOneFulfilled = '[Task Constraints] Update one fulfilled',
    UpdateOneRejected = '[Task Constraints] Update one rejected',
    UpdateOneReset = '[Task Constraints] Update one reset',
}

export namespace TaskConstraintsActions {
    export namespace Initialize {
        export class All implements Action {
            readonly type = TaskConstraintsActionEnum.InitializeAll;
        }
    }

    export namespace Request {
        export class One implements Action {
            readonly type = TaskConstraintsActionEnum.RequestOne;

            constructor(public taskId: string) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = TaskConstraintsActionEnum.RequestOneFulfilled;

            constructor(public taskId: string,
                        public payload: TaskConstraintsResource) {
            }
        }

        export class OneRejected implements Action {
            readonly type = TaskConstraintsActionEnum.RequestOneRejected;

            constructor(public taskId: string) {
            }
        }
    }

    export namespace Update {
        export class One implements Action {
            readonly type = TaskConstraintsActionEnum.UpdateOne;

            constructor(public taskId: string,
                        public payload: SaveTaskConstraintsResource) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = TaskConstraintsActionEnum.UpdateOneFulfilled;

            constructor(public taskId: string,
                        public payload: TaskConstraintsResource) {
            }
        }

        export class OneRejected implements Action {
            readonly type = TaskConstraintsActionEnum.UpdateOneRejected;

            constructor(public taskId: string) {
            }
        }

        export class OneReset implements Action {
            readonly type = TaskConstraintsActionEnum.UpdateOneReset;

            constructor(public taskId: string) {
            }
        }
    }
}

export type TaskConstraintsActions =
    TaskConstraintsActions.Initialize.All |
    TaskConstraintsActions.Request.One |
    TaskConstraintsActions.Request.OneFulfilled |
    TaskConstraintsActions.Request.OneRejected |
    TaskConstraintsActions.Update.One |
    TaskConstraintsActions.Update.OneFulfilled |
    TaskConstraintsActions.Update.OneRejected |
    TaskConstraintsActions.Update.OneReset;
