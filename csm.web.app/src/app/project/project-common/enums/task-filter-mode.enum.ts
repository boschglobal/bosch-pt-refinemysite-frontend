/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../../shared/misc/helpers/enum.helper';

export enum TaskFilterMode {
    list = 'list',
    calendar = 'calendar'
}

export const TaskFilterModeEnumHelper = new EnumHelper('TaskFilterMode', TaskFilterMode);
