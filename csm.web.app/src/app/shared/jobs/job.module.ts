/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {EffectsModule} from '@ngrx/effects';
import {TranslateModule} from '@ngx-translate/core';

import {FeedbackModule} from '../feedback/feedback.module';
import {IconModule} from '../ui/icons/icon.module';
import {UIModule} from '../ui/ui.module';
import {JobListButtonComponent} from './containers/job-list-button/job-list-button.component';
import {JobCardComponent} from './presentationals/job-card/job-card.component';
import {JobCardListComponent} from './presentationals/job-card-list/job-card-list.component';
import {JobCardStatusComponent} from './presentationals/job-card-status/job-card-status.component';
import {JobEffects} from './store/job.effects';

@NgModule({
    imports: [
        CommonModule,
        EffectsModule.forFeature([
            JobEffects,
        ]),
        FeedbackModule,
        IconModule,
        TranslateModule,
        UIModule,
    ],
    declarations: [
        JobCardComponent,
        JobCardListComponent,
        JobCardStatusComponent,
        JobListButtonComponent,
    ],
    exports: [
        JobCardComponent,
        JobCardListComponent,
        JobCardStatusComponent,
        JobListButtonComponent,
    ],
})
export class JobModule {
}
