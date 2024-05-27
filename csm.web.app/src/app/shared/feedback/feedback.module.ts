/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {TranslationModule} from '../translation/translation.module';
import {IconModule} from '../ui/icons/icon.module';
import {UIModule} from '../ui/ui.module';
import {NoItemsComponent} from './presentationals/no-items-component/no-items.component';

@NgModule({
    imports: [
        RouterModule,
        CommonModule,
        IconModule,
        UIModule,
        TranslationModule,
    ],
    declarations: [
        NoItemsComponent,
    ],
    exports: [
        NoItemsComponent,
    ]
})
export class FeedbackModule {}
