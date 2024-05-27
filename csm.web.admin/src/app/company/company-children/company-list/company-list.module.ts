/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';

import {CompanyListComponent} from './company-list.component';
import {SharedModule} from '../../../shared/shared.module';

@NgModule({
    imports: [
        SharedModule,
    ],
    declarations: [
        CompanyListComponent
    ],
    exports: [
        CompanyListComponent
    ]
})
export class CompanyListModule {
}
