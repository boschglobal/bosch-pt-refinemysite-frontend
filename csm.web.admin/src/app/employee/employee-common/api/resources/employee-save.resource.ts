/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {EmployeeRoleEnum} from './employee-roles.enum';

export interface EmployeeSaveResource {
    userId: string;
    roles: EmployeeRoleEnum[];
}
