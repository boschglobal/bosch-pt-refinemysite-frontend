/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../../../shared/misc/helpers/enum.helper';

export enum EmployeeRoleEnum {
    CA = 'CA',
    CR = 'CR',
    CSM = 'CSM',
    FM = 'FM',
}

export const employeeRolesEnumHelper = new EnumHelper('EmployeeRoleEnum', EmployeeRoleEnum);
