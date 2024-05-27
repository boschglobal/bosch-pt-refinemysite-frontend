/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {NavbarComponent} from './navbar/navbar.component';
import {TranslationModule} from '../translation/translation.module';

@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
        MatTabsModule,
        RouterModule,
        TranslationModule,
    ],
    declarations: [
        NavbarComponent
    ],
    exports: [
        NavbarComponent
    ],
})
export class NavigationModule {
}
