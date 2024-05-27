/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';

import {CookieModule} from '../cookie/cookie.module';
import {TranslationModule} from '../translation/translation.module';
import {ModalModule} from '../ui/modal/modal.module';
import {UIModule} from '../ui/ui.module';
import {PrivacySettingsModalComponent} from './containers/privacy-settings-modal/privacy-settings-modal.component';
import {PrivacySettingsComponent} from './presentationals/privacy-settings/privacy-settings.component';

@NgModule({
    imports: [
        CommonModule,
        CookieModule,
        ModalModule,
        ReactiveFormsModule,
        TranslationModule,
        UIModule,
    ],
    declarations: [
        PrivacySettingsComponent,
        PrivacySettingsModalComponent,
    ],
    exports: [
        PrivacySettingsComponent,
        PrivacySettingsModalComponent,
    ],
})
export class PrivacyModule {
}
