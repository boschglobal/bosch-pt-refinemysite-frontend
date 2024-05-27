/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../misc/helpers/enum.helper';

export enum SortDirectionEnum {
    Asc = 'asc',
    Desc = 'desc',
    Neutral = ''
}

export const sortDirectionEnumHelper = new EnumHelper('SortDirectionEnum', SortDirectionEnum);
