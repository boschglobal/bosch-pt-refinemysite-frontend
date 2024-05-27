/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */
import {EnumHelper} from '../../../shared/misc/helpers/enum.helper';

export enum TaskCardDescriptionTypeEnum {
    Company = 'COMPANY',
    Assignee = 'ASSIGNEE',
    Craft = 'CRAFT',
}

export const TaskCardDescriptionTypeEnumHelper = new EnumHelper('TaskCardDescriptionTypeEnum', TaskCardDescriptionTypeEnum);
