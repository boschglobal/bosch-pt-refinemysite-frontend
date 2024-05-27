/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

import {NotAuthorisedComponent} from './not-authorised-component/not-authorised.component';

@NgModule({
    imports: [
        RouterModule,
        CommonModule,
    ],
    declarations: [
        NotAuthorisedComponent,

    ],
    exports: [
        NotAuthorisedComponent,
    ]
})
export class FeedbackModule {}
