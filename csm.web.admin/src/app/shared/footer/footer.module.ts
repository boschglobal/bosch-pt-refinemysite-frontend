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

import {FooterComponent} from './components/footer-component/footer.component';
import {MiscModule} from '../misc/misc.module';
import {TranslationModule} from '../translation/translation.module';

@NgModule({
    imports: [
        CommonModule,
        MiscModule,
        TranslationModule,
    ],
    declarations: [FooterComponent],
    exports: [FooterComponent]
})
export class FooterModule {
    static forRoot(): ModuleWithProviders<any> {
        return {
            ngModule: FooterModule
        };
    }
}
