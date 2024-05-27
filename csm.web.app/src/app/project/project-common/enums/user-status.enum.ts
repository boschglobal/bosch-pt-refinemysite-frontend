/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../../shared/misc/helpers/enum.helper';

export enum UserStatusEnum {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    INVITED = 'INVITED',
    VALIDATION = 'VALIDATION',
}

export const USER_STATUS_ENUM_HELPER = new EnumHelper('UserStatusEnum', UserStatusEnum);
