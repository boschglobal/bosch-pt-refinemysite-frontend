/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {CompanyModule} from '../company/company.module';
import {EmployeeModule} from '../employee/employee.module';
import {FeatureModule} from '../feature/feature.module';
import {FeatureToggleModule} from '../feature-toggle/feature-toggle-common/feature-toggle.module';
import {MANAGEMENT_ROUTES} from './management-routing.routes';
import {ManagementComponent} from './presentational/management.component';
import {ProjectModule} from '../project/project.module';
import {SharedModule} from '../shared/shared.module';
import {UserModule} from '../user/user.module';

@NgModule({
    declarations: [
        ManagementComponent
    ],
    imports: [
        CommonModule,
        CompanyModule,
        EmployeeModule,
        FeatureModule,
        FeatureToggleModule,
        ProjectModule,
        RouterModule.forChild(MANAGEMENT_ROUTES),
        SharedModule,
        UserModule
    ]
})
export class ManagementModule {
}
