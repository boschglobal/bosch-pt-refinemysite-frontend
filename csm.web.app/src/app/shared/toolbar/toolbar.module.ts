/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';

import {UIModule} from '../ui/ui.module';
import {ToolbarComponent} from './components/toolbar.component';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        UIModule,
    ],
    declarations: [
        ToolbarComponent
    ],
    exports: [
        ToolbarComponent
    ]
})
export class ToolbarModule {}
