/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {EffectsModule} from '@ngrx/effects';

import {FeatureChildrenModule} from './feature-children/feature-children.module';
import {FeatureComponent} from './feature.component';
import {FeatureEffects} from './feature-common/store/feature.effects';

@NgModule({
    imports: [
        EffectsModule.forFeature([FeatureEffects]),
        FeatureChildrenModule,
        RouterModule,
    ],
    declarations: [
        FeatureComponent,
    ]
})
export class FeatureModule {
}
