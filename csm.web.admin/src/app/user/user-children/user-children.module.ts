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

import {EmployeeModule} from '../../employee/employee.module';
import {SharedModule} from '../../shared/shared.module';
import {UserChildrenComponent} from './user-children.component';
import {UserCommonModule} from '../user-common/user-common.module';
import {UserDetailsComponent} from './user-details/user-details.component';
import {UserListComponent} from './user-list/user-list.component';

@NgModule({
    imports: [
        CommonModule,
        EmployeeModule,
        RouterModule,
        SharedModule,
        UserCommonModule,
    ],
    declarations: [
        UserChildrenComponent,
        UserDetailsComponent,
        UserListComponent,
        UserListComponent,
    ]
})
export class UserChildrenModule {
}
