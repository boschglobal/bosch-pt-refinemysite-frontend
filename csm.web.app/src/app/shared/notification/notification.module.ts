/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {EffectsModule} from '@ngrx/effects';
import {TranslateModule} from '@ngx-translate/core';

import {FeedbackModule} from '../feedback/feedback.module';
import {IconModule} from '../ui/icons/icon.module';
import {UIModule} from '../ui/ui.module';
import {NotificationComponent} from './components/notification/notification.component';
import {NotificationListComponent} from './containers/notification-list/notification-list.component';
import {NotificationEffects} from './store/notification.effects';

@NgModule({
    imports: [
        CommonModule,
        UIModule,
        IconModule,
        FeedbackModule,
        TranslateModule,
        EffectsModule.forFeature([
            NotificationEffects,
        ]),
        RouterModule,
    ],
    declarations: [
        NotificationComponent,
        NotificationListComponent,
    ],
    exports: [
        NotificationComponent,
        NotificationListComponent
    ],
})
export class NotificationModule {}
