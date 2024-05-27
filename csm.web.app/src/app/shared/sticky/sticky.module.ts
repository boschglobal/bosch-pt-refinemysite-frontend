/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {StickyDirective} from './directives/sticky.directive';
import {StickyMirrorComponent} from './presentationals/sticky-mirror/sticky-mirror.component';

@NgModule({
    imports: [
        CommonModule,
    ],
    exports: [
        StickyDirective,
    ],
    declarations: [
        StickyDirective,
        StickyMirrorComponent,
    ]
})
export class StickyModule {}
