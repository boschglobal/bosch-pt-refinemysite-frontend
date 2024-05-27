/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {SupergraphicComponent} from './presentationals/supergraphic/supergraphic.component';
import {TranslationModule} from '../translation/translation.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        TranslationModule,
    ],
    declarations: [
        SupergraphicComponent,
    ],
    exports: [
        SupergraphicComponent,
    ]
})
export class MiscModule {}
