/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {CreateProjectCopyResource} from '../../api/project-copy/resources/create-project-copy.resource';

export enum ProjectCopyActionEnum {
    InitializeAll = '[Project Copy] Initialize all',
    CopyOne = '[Project Copy] Copy One',
    CopyOneFulfilled = '[Project Copy] Copy fulfilled',
    CopyOneRejected = '[Project Copy] Copy rejected',
    CopyOneReset = '[Project Copy] Copy reset',
}

export namespace ProjectCopyAction {
    export namespace Initialize {
        export class All implements Action {
            public readonly type = ProjectCopyActionEnum.InitializeAll;
        }
    }

    export namespace Copy {
        export class One implements Action {
            public readonly type = ProjectCopyActionEnum.CopyOne;

            constructor(public projectId: string,
                        public projectCopy: CreateProjectCopyResource) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = ProjectCopyActionEnum.CopyOneFulfilled;

            constructor(public id: string) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = ProjectCopyActionEnum.CopyOneRejected;
        }

        export class OneReset implements Action {
            public readonly type = ProjectCopyActionEnum.CopyOneReset;
        }
    }
}

export type ProjectCopyActions =
    ProjectCopyAction.Initialize.All |
    ProjectCopyAction.Copy.One |
    ProjectCopyAction.Copy.OneFulfilled |
    ProjectCopyAction.Copy.OneRejected |
    ProjectCopyAction.Copy.OneReset;
