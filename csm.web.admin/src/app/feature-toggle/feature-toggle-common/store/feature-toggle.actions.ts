/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {FeatureToggleListResource} from '../api/resources/feature-toggle-list.resource';
import {FeatureToggleResource} from '../api/resources/feature-toggle.resource';
import {ObjectTypeEnum} from '../../../shared/misc/enums/object-type.enum';

export enum FeatureToggleActionsEnum {
    DeleteFeatureToggleBySubjectId = '[FeatureToggle] Delete feature toggle by subject id',
    DeleteFeatureToggleBySubjectIdFulfilled = '[FeatureToggle] Delete feature toggle by subject id fulfilled',
    DeleteFeatureToggleBySubjectIdRejected = '[FeatureToggle] Delete feature toggle by subject id rejected',
    InitializeAll = '[FeatureToggle] Initialize all',
    RequestFeatureTogglesBySubjectId = '[FeatureToggle] Request feature toggles by subject id',
    RequestFeatureTogglesBySubjectIdFulfilled = '[FeatureToggle] Request feature toggles by subject id fulfilled',
    RequestFeatureTogglesBySubjectIdRejected = '[FeatureToggle] Request feature toggles by subject id rejected',
    SetFeatureToggleBySubjectId = '[FeatureToggle] Set toggle by subject id',
    SetFeatureToggleBySubjectIdFulfilled = '[FeatureToggle] Set toggle by subject id fulfilled',
    SetFeatureToggleBySubjectIdRejected = '[FeatureToggle] Set toggle by subject id rejected',
}

export namespace FeatureToggleAction {

    export namespace Initialize {
        export class All implements Action {
            readonly type = FeatureToggleActionsEnum.InitializeAll;

            constructor() {
            }
        }
    }

    export namespace Request {
        export class FeatureTogglesBySubjectId implements Action {
            readonly type = FeatureToggleActionsEnum.RequestFeatureTogglesBySubjectId;

            constructor(public subjectId: string) {
            }
        }

        export class FeatureTogglesBySubjectIdFulfilled implements Action {
            readonly type = FeatureToggleActionsEnum.RequestFeatureTogglesBySubjectIdFulfilled;

            constructor(public payload: FeatureToggleListResource) {
            }
        }

        export class FeatureTogglesBySubjectIdRejected implements Action {
            readonly type = FeatureToggleActionsEnum.RequestFeatureTogglesBySubjectIdRejected;

            constructor() {
            }
        }
    }

    export namespace Set {
        export class FeatureToggleBySubjectId implements Action {
            readonly type = FeatureToggleActionsEnum.SetFeatureToggleBySubjectId;

            constructor(public featureName: string,
                        public subjectId: string,
                        public toggleType: ObjectTypeEnum) {
            }
        }

        export class FeatureToggleBySubjectIdFulfilled implements Action {
            readonly type = FeatureToggleActionsEnum.SetFeatureToggleBySubjectIdFulfilled;

            constructor(public payload: FeatureToggleResource) {
            }
        }

        export class FeatureToggleBySubjectIdRejected implements Action {
            readonly type = FeatureToggleActionsEnum.SetFeatureToggleBySubjectIdRejected;

            constructor() {
            }
        }
    }

    export namespace Delete {
        export class FeatureToggleBySubjectId implements Action {
            readonly type = FeatureToggleActionsEnum.DeleteFeatureToggleBySubjectId;

            constructor(public featureName: string,
                        public subjectId: string) {
            }
        }

        export class FeatureToggleBySubjectIdFulfilled implements Action {
            readonly type = FeatureToggleActionsEnum.DeleteFeatureToggleBySubjectIdFulfilled;

            constructor() {
            }
        }

        export class FeatureToggleBySubjectIdRejected implements Action {
            readonly type = FeatureToggleActionsEnum.DeleteFeatureToggleBySubjectIdRejected;

            constructor() {
            }
        }
    }
}

export type FeatureToggleActions =
    FeatureToggleAction.Delete.FeatureToggleBySubjectId |
    FeatureToggleAction.Delete.FeatureToggleBySubjectIdFulfilled |
    FeatureToggleAction.Delete.FeatureToggleBySubjectIdRejected |
    FeatureToggleAction.Initialize.All |
    FeatureToggleAction.Request.FeatureTogglesBySubjectId |
    FeatureToggleAction.Request.FeatureTogglesBySubjectIdFulfilled |
    FeatureToggleAction.Request.FeatureTogglesBySubjectIdRejected |
    FeatureToggleAction.Set.FeatureToggleBySubjectId |
    FeatureToggleAction.Set.FeatureToggleBySubjectIdFulfilled |
    FeatureToggleAction.Set.FeatureToggleBySubjectIdRejected;
