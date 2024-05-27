/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../../shared/misc/helpers/enum.helper';

export enum ParticipantRoleEnum {
    FM = 'FM',
    CR = 'CR',
    CSM = 'CSM'
}

export const ParticipantRoleEnumHelper = new EnumHelper('ParticipantRoleEnum', ParticipantRoleEnum);
