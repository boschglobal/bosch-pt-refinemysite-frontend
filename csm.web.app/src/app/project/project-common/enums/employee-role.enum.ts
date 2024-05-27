/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../../shared/misc/helpers/enum.helper';

export enum EmployeeRoleEnum {
    FM = 'FM',
    CSM = 'CSM',
    CR = 'CR',
    CA = 'CA'
}

export const EmployeeRoleEnumHelper = new EnumHelper('EmployeeRoleEnum', EmployeeRoleEnum);
