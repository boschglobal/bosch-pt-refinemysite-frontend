/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {
    MAT_PAGINATOR_DEFAULT_OPTIONS,
    MatPaginatorDefaultOptions,
    MatPaginatorModule
} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {
    MatSnackBarModule,
    MatSnackBarRef
} from '@angular/material/snack-bar';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {
    ModuleWithProviders,
    NgModule
} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';

import {AlertModule} from './alert/alert.module';
import {DialogModule} from './dialog/dialog.module';
import {FeedbackModule} from './feedback/feedback.module';
import {FooterModule} from './footer/footer.module';
import {HeaderModule} from './header/header.module';
import {MiscModule} from './misc/misc.module';
import {NavigationModule} from './navigation/navigation.module';
import {RestModule} from './rest/rest.module';
import {TranslationModule} from './translation/translation.module';
import {UIModule} from './ui/ui.module';

@NgModule({
    exports: [
        AlertModule,
        CommonModule,
        DialogModule,
        FeedbackModule,
        FooterModule,
        FormsModule,
        HeaderModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatFormFieldModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatSortModule,
        MatTableModule,
        MiscModule,
        NavigationModule,
        ReactiveFormsModule,
        RestModule,
        TranslationModule,
        UIModule
    ],
    providers: [
        {
            provide: MatSnackBarRef,
            useValue: {}
        },
    ],
    imports: [
        BrowserModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatGridListModule,
        MatInputModule,
        MatTabsModule,
        RouterModule
    ],
})
export class SharedModule {
    static forRoot(): ModuleWithProviders<SharedModule>[] {
        return [
            ...TranslationModule.forRoot(),
            {ngModule: AlertModule},
            {ngModule: CommonModule},
            {ngModule: DialogModule},
            {ngModule: FeedbackModule},
            {ngModule: FooterModule},
            {ngModule: FormsModule},
            {ngModule: MatAutocompleteModule},
            {ngModule: MatButtonModule},
            {ngModule: MatPaginatorModule},
            {ngModule: MatProgressSpinnerModule},
            {ngModule: MatSelectModule},
            {ngModule: MatSlideToggleModule},
            {ngModule: MatSnackBarModule},
            {ngModule: MatSortModule},
            {ngModule: MatTableModule},
            {ngModule: MatTabsModule},
            {ngModule: MiscModule},
            {ngModule: NavigationModule},
            {ngModule: ReactiveFormsModule},
            {ngModule: RestModule},
            {ngModule: UIModule},
        ];
    }
}
