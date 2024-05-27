/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../../shared/misc/helpers/enum.helper';

export enum ChartTypeEnum {
    Line = 'Line',
    StackedBar = 'StackedBar',
    GroupedBar = 'GroupedBar',
}

export const ChartTypeEnumHelper = new EnumHelper('ChartTypeEnum', ChartTypeEnum);
