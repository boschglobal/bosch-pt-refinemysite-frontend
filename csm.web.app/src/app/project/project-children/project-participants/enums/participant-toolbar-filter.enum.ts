/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../../../shared/misc/helpers/enum.helper';

export enum ParticipantToolbarFilterEnum {
    ALL = 'ALL',
    ACTIVE = 'ACTIVE',
    PENDING = 'PENDING',
}

export const PARTICIPANT_TOOLBAR_FILTER_ENUM_HELPER = new EnumHelper('ParticipantToolbarFilterEnum', ParticipantToolbarFilterEnum);
