/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import {EffectsModule} from '@ngrx/effects';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {CompanyChildrenModule} from './company-children/company-children.module';
import {CompanyCommonModule} from './company-common/company-common.module';
import {CompanyComponent} from './company.component';
import {CompanyDetailComponent} from './company-children/company-detail/company-detail.component';
import {CompanyEffects} from './company-common/store/company.effects';
import {EmployeeModule} from '../employee/employee.module';
import {SharedModule} from '../shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        CompanyChildrenModule,
        CompanyCommonModule,
        EffectsModule.forFeature([CompanyEffects]),
        EmployeeModule,
        MatTabsModule,
        RouterModule,
        SharedModule,
    ],
    declarations: [
        CompanyComponent,
        CompanyDetailComponent,
    ],
})
export class CompanyModule {
}
