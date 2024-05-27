/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {TranslationModule} from '../translation/translation.module';
import {IconModule} from '../ui/icons/icon.module';
import {UIModule} from '../ui/ui.module';
import {TheaterComponent} from './containers/theater-component/theater.component';

@NgModule({
    imports: [
        CommonModule,
        IconModule,
        UIModule,
        TranslationModule,
    ],
    declarations: [
        TheaterComponent,
    ],
    exports: [
        TheaterComponent,
    ],
})
export class TheaterModule {}
