/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../../shared/misc/helpers/enum.helper';

export enum DayCardStatusEnum {
    Approved = 'APPROVED',
    Done = 'DONE',
    NotDone = 'NOTDONE',
    Open = 'OPEN'
}

export const DayCardStatusEnumHelper = new EnumHelper('DayCardStatusEnum', DayCardStatusEnum);
