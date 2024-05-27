/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {EffectsModule} from '@ngrx/effects';

import {TranslationModule} from '../translation/translation.module';
import {IconModule} from '../ui/icons/icon.module';
import {AlertListComponent} from './container/alert-list/alert-list.component';
import {AnnouncementListComponent} from './container/announcement-list/announcement-list.component';
import {AlertComponent} from './presentationals/alert/alert.component';
import {CalloutComponent} from './presentationals/callout/callout.component';
import {AlertEffects} from './store/alert.effects';

@NgModule({
    imports: [
        CommonModule,
        EffectsModule.forFeature([AlertEffects]),
        IconModule,
        TranslationModule,
    ],
    declarations: [
        AlertListComponent,
        AlertComponent,
        AnnouncementListComponent,
        CalloutComponent,
    ],
    exports: [
        AlertListComponent,
        AnnouncementListComponent,
        CalloutComponent,
    ],
})
export class AlertModule {
}
