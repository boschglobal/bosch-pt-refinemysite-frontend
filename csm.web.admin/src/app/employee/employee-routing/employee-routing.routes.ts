/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Routes} from '@angular/router';

import {EmployeeComponent} from '../employee.component';
import {EmployeeListComponent} from '../employee-children/employee-list/employee-list.component';

export const EMPLOYEE_ROUTE_PATHS: any = {
    employees: 'employees',
};

export const EMPLOYEE_ROUTES: Routes = [
    {
        path: `${EMPLOYEE_ROUTE_PATHS.employees}`,
        component: EmployeeComponent,
        children: [
            {
                path: '',
                component: EmployeeListComponent,
            },
        ]
    },
];
