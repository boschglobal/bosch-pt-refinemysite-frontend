/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {AnimationModule} from '../../animation/animation.module';
import {MarkerComponent} from './marker.component';

@NgModule({
    imports: [
        CommonModule,
        AnimationModule,
    ],
    declarations: [
        MarkerComponent,
    ],
    exports: [
        MarkerComponent,
    ],
})
export class MarkerModule {
}
