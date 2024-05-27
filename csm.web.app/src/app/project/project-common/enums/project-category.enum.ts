/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../../shared/misc/helpers/enum.helper';

export enum ProjectCategoryEnum {
    NB = 'NB',
    OB = 'OB',
    RB = 'RB'
}

export const ProjectCategoryEnumHelper = new EnumHelper('ProjectCategoryEnum', ProjectCategoryEnum);
