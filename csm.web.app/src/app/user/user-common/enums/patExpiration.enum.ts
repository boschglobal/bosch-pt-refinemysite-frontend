/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../../shared/misc/helpers/enum.helper';

export enum PATExpirationEnum {
    ThirtyDays = '43200',
    NinetyDays = '129600',
    OnHundredEightyDays = '259200',
    OneYear = '525600',
}

export const patExpirationEnumHelper = new EnumHelper('PATExpirationEnum', PATExpirationEnum);
