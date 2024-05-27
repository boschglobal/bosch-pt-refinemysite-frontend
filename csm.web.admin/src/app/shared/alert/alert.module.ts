/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {BrowserModule} from '@angular/platform-browser';
import {MatIconModule} from '@angular/material/icon';
import {NgModule} from '@angular/core';

import {AlertListComponent} from './container/alert-list/alert-list.component';
import {TranslationModule} from '../translation/translation.module';
import {SnackbarComponent} from './presentationals/snackbar/snackbar.component';

@NgModule({
    imports: [
        BrowserModule,
        MatIconModule,
        TranslationModule,
    ],
    declarations: [
        AlertListComponent,
        SnackbarComponent,
    ],
    exports: [
        AlertListComponent,
    ]
})
export class AlertModule {
}
