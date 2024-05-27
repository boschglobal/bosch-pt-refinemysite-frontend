/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {AnimationModule} from '../../animation/animation.module';
import {IconComponent} from './icon.component';

@NgModule({
    imports: [
        AnimationModule,
        CommonModule,
    ],
    declarations: [
        IconComponent,
    ],
    exports: [
        IconComponent,
    ],
})
export class IconModule {
}
