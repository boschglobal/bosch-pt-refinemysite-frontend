/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {CompanyChildrenComponent} from './company-children.component';
import {CompanyCommonModule} from '../company-common/company-common.module';
import {CompanyCreateComponent} from './company-create/company-create.component';
import {CompanyDetailFeaturesComponent} from './company-detail/company-detail-features/company-detail-features.component';
import {CompanyDetailGeneralComponent} from './company-detail/company-detail-general/company-detail-general.component';
import {CompanyEditComponent} from './company-edit/company-edit.component';
import {CompanyListModule} from './company-list/company-list.module';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
    imports: [
        CompanyCommonModule,
        CompanyListModule,
        RouterModule,
        SharedModule,
    ],
    declarations: [
        CompanyChildrenComponent,
        CompanyCreateComponent,
        CompanyDetailFeaturesComponent,
        CompanyDetailGeneralComponent,
        CompanyEditComponent,
    ]
})
export class CompanyChildrenModule {
}
