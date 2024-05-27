/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';
import {EffectsModule} from '@ngrx/effects';

import {CraftEffects} from './store/crafts/craft.effects';

@NgModule({
    imports: [
        EffectsModule.forFeature([CraftEffects]),
    ],
})
export class MasterDataModule {
}
