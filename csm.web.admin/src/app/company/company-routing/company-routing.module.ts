/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';

import {CompanyListModule} from '../company-children/company-list/company-list.module';

@NgModule({
    imports: [
        CompanyListModule,
    ]
})
export class CompanyRoutingModule {
}
