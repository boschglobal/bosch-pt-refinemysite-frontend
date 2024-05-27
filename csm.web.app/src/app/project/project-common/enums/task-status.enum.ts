/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../../shared/misc/helpers/enum.helper';

export enum TaskStatusEnum {
    ACCEPTED = 'ACCEPTED',
    CLOSED = 'CLOSED',
    DRAFT = 'DRAFT',
    OPEN = 'OPEN',
    STARTED = 'STARTED',
}

export const TaskStatusEnumHelper = new EnumHelper('TaskStatusEnum', TaskStatusEnum);
