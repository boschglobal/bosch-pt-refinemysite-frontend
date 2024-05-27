/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';
import {EffectsModule} from '@ngrx/effects';

import {RealtimeEffects} from './store/realtime.effects';

@NgModule({
    imports: [
        EffectsModule.forFeature([
            RealtimeEffects,
        ]),
    ]
})
export class RealtimeModule {
}
