/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ModuleWithProviders,
    NgModule
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';

import {ConfirmationDialogComponent} from './components/confirmation-dialog/confirmation-dialog.component';
import {TranslationModule} from '../translation/translation.module';
import {MiscModule} from '../misc/misc.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MiscModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        TranslationModule,
    ],
    declarations: [ConfirmationDialogComponent],
    exports: [ConfirmationDialogComponent]
})
export class DialogModule {
    static forRoot(): ModuleWithProviders<any> {
        return {
            ngModule: DialogModule
        };
    }
}
