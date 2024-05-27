/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../../shared/misc/helpers/enum.helper';

export enum ProjectCategoryEnum {
    NB = 'NB',
    OB = 'OB',
    RB = 'RB'
}

export const projectCategoryEnumHelper = new EnumHelper('ProjectCategoryEnum', ProjectCategoryEnum);
