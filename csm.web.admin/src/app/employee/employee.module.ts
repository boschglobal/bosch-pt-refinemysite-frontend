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

import {EmployeeCaptureComponent} from './employee-common/presentationals/employee-capture/employee-capture.component';
import {EmployeeComponent} from './employee.component';
import {EmployeeCreateComponent} from './employee-children/employee-create/employee-create.component';
import {EmployeeEditComponent} from './employee-children/employee-edit/employee-edit.component';
import {EmployeeEffects} from './employee-common/store/employee.effects';
import {EmployeeListComponent} from './employee-children/employee-list/employee-list.component';
import {SharedModule} from '../shared/shared.module';

@NgModule({
    declarations: [
        EmployeeComponent,
        EmployeeListComponent,
        EmployeeCreateComponent,
        EmployeeCaptureComponent,
        EmployeeEditComponent
    ],
    exports: [
        EmployeeListComponent,
        EmployeeCaptureComponent
    ],
    imports: [
        CommonModule,
        EffectsModule.forFeature([EmployeeEffects]),
        RouterModule,
        SharedModule,
    ],
})
export class EmployeeModule {}
