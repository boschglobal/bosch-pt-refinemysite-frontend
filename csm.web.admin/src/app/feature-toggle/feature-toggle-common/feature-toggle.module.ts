
/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';
import {EffectsModule} from '@ngrx/effects';

import {FeatureToggleEffects} from './store/feature-toggle.effects';

@NgModule({
    imports: [
        EffectsModule.forFeature([FeatureToggleEffects])
    ]
})
export class FeatureToggleModule {
}
