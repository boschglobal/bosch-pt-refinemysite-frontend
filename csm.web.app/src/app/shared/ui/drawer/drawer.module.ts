/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {DrawerComponent} from './drawer/drawer.component';

@NgModule({
    imports: [CommonModule],
    declarations: [DrawerComponent],
    exports: [DrawerComponent]
})
export class DrawerModule {
}
