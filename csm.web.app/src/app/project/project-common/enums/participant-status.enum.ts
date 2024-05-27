/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../../shared/misc/helpers/enum.helper';

export enum ParticipantStatusEnum {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    INVITED = 'INVITED',
    VALIDATION = 'VALIDATION',
}

export const PARTICIPANT_STATUS_ENUM_HELPER = new EnumHelper('ParticipantStatusEnum', ParticipantStatusEnum);
