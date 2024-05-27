/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {RouterModule} from '@angular/router';

import {RolesPipe} from './pipes/role.pipe';
import {TranslationModule} from '../translation/translation.module';
import {LoaderComponent} from './loader/loader.component';
import {ButtonLinkComponent} from './links/button-link/button-link-component/button-link.component';

@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        RouterModule,
        TranslationModule,
    ],
    declarations: [
        ButtonLinkComponent,
        LoaderComponent,
        RolesPipe,
    ],
    exports: [
        ButtonLinkComponent,
        LoaderComponent,
        RolesPipe
    ],
})
export class UIModule {
}
