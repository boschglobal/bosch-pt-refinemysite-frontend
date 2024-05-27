/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../../shared/misc/helpers/enum.helper';

export enum MilestoneTypeEnum {
    Investor = 'INVESTOR',
    Project = 'PROJECT',
    Craft = 'CRAFT',
}

export const MilestoneTypeEnumHelper = new EnumHelper('MilestoneTypeEnum', MilestoneTypeEnum);
