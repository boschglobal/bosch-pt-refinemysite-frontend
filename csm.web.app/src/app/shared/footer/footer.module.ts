/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {MiscModule} from '../misc/misc.module';
import {TranslationModule} from '../translation/translation.module';
import {UIModule} from '../ui/ui.module';
import {FooterComponent} from './components/footer-component/footer.component';

@NgModule({
    imports: [
        CommonModule,
        MiscModule,
        TranslationModule,
        UIModule,
    ],
    declarations: [FooterComponent],
    exports: [FooterComponent]
})
export class FooterModule {}
