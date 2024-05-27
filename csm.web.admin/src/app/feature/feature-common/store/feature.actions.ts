/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {FeatureListResource} from '../api/resources/feature-list.resource';
import {FeatureResource} from '../api/resources/feature.resource';

export enum FeatureActionsEnum {
    CreateFeature = '[Feature] Create feature',
    CreateFeatureFulfilled = '[Feature] Create feature fulfilled',
    CreateFeatureRejected = '[Feature] Create feature rejected',
    CreateFeatureReset = '[Feature] Create feature reset',
    InitializeAll = '[Feature] Initialize all',
    RequestFeatures = '[Feature] Request features',
    RequestFeaturesFulfilled = '[Feature] Request features fulfilled',
    RequestFeaturesRejected = '[Feature] Request features rejected',
    SetFeatureDisable = '[Feature] Set feature disable',
    SetFeatureDisableFulfilled = '[Feature] Set feature disable fulfilled',
    SetFeatureDisableRejected = '[Feature] Set feature disable rejected',
    SetFeatureEnable = '[Feature] Set feature enable',
    SetFeatureEnableFulfilled = '[Feature] Set feature enable fulfilled',
    SetFeatureEnableRejected = '[Feature] Set feature enable rejected',
    SetFeatureReset = '[Feature] Set feature reset',
    SetFeatureWhitelistActive = '[Feature] Set feature whitelist active',
    SetFeatureWhitelistActiveFulfilled = '[Feature] Set feature whitelist active fulfilled',
    SetFeatureWhitelistActiveRejected = '[Feature] Set feature whitelist active rejected',
}

export namespace FeatureAction {
    export namespace Initialize {
        export class All implements Action {
            readonly type = FeatureActionsEnum.InitializeAll;

            constructor() {
            }
        }
    }

    export namespace Create {
        export class Feature implements Action {
            readonly type = FeatureActionsEnum.CreateFeature;

            constructor(public featureName: string) {
            }
        }

        export class FeatureFulfilled implements Action {
            readonly type = FeatureActionsEnum.CreateFeatureFulfilled;

            constructor(public feature: FeatureResource) {
            }
        }

        export class FeatureRejected implements Action {
            readonly type = FeatureActionsEnum.CreateFeatureRejected;

            constructor() {
            }
        }

        export class FeatureReset implements Action {
            readonly type = FeatureActionsEnum.CreateFeatureReset;

            constructor() {
            }
        }
    }


    export namespace Request {
        export class Features implements Action {
            readonly type = FeatureActionsEnum.RequestFeatures;

            constructor() {
            }
        }

        export class FeaturesFulfilled implements Action {
            readonly type = FeatureActionsEnum.RequestFeaturesFulfilled;

            constructor(public payload: FeatureListResource) {
            }
        }

        export class FeaturesRejected implements Action {
            readonly type = FeatureActionsEnum.RequestFeaturesRejected;

            constructor() {
            }
        }
    }

    export namespace Set {
        export class FeatureEnable implements Action {
            readonly type = FeatureActionsEnum.SetFeatureEnable;

            constructor(public featureName: string) {
            }
        }

        export class FeatureEnableFulfilled implements Action {
            readonly type = FeatureActionsEnum.SetFeatureEnableFulfilled;

            constructor(public feature: FeatureResource) {
            }
        }

        export class FeatureEnableRejected implements Action {
            readonly type = FeatureActionsEnum.SetFeatureEnableRejected;

            constructor() {
            }
        }

        export class FeatureDisable implements Action {
            readonly type = FeatureActionsEnum.SetFeatureDisable;

            constructor(public featureName: string) {
            }
        }

        export class FeatureDisableFulfilled implements Action {
            readonly type = FeatureActionsEnum.SetFeatureDisableFulfilled;

            constructor(public feature: FeatureResource) {
            }
        }

        export class FeatureDisableRejected implements Action {
            readonly type = FeatureActionsEnum.SetFeatureDisableRejected;

            constructor() {
            }
        }

        export class FeatureWhitelistActive implements Action {
            readonly type = FeatureActionsEnum.SetFeatureWhitelistActive;

            constructor(public featureName: string) {
            }
        }

        export class FeatureWhitelistActiveFulfilled implements Action {
            readonly type = FeatureActionsEnum.SetFeatureWhitelistActiveFulfilled;

            constructor(public feature: FeatureResource) {
            }
        }

        export class FeatureWhitelistActiveRejected implements Action {
            readonly type = FeatureActionsEnum.SetFeatureWhitelistActiveRejected;

            constructor() {
            }
        }

        export class FeatureReset implements Action {
            readonly type = FeatureActionsEnum.SetFeatureReset;

            constructor() {
            }
        }
    }
}

export type FeatureActions =
    FeatureAction.Create.Feature |
    FeatureAction.Create.FeatureFulfilled |
    FeatureAction.Create.FeatureRejected |
    FeatureAction.Create.FeatureReset |
    FeatureAction.Initialize.All |
    FeatureAction.Request.Features |
    FeatureAction.Request.FeaturesFulfilled |
    FeatureAction.Request.FeaturesRejected |
    FeatureAction.Set.FeatureDisable |
    FeatureAction.Set.FeatureDisableFulfilled |
    FeatureAction.Set.FeatureDisableRejected |
    FeatureAction.Set.FeatureEnable |
    FeatureAction.Set.FeatureEnableFulfilled |
    FeatureAction.Set.FeatureEnableRejected |
    FeatureAction.Set.FeatureReset |
    FeatureAction.Set.FeatureWhitelistActive |
    FeatureAction.Set.FeatureWhitelistActiveFulfilled |
    FeatureAction.Set.FeatureWhitelistActiveRejected;
