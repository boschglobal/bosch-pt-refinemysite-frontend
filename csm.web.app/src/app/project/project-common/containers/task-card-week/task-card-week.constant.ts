/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {CALENDAR_CONSTANTS} from '../../../../shared/ui/calendar/contants/calendar.contants';
import {DIMENSIONS} from '../../../../shared/ui/constants/dimensions.constant';

export const TASK_CARD_WEEK_DIMENSIONS = {
    baseHeight: DIMENSIONS.base_dimension__x4,
    descriptionHeight: DIMENSIONS.base_dimension__x2,
    indicatorsHeight: DIMENSIONS.base_dimension__x3,
    daycardsHeight: CALENDAR_CONSTANTS.daycardWidth,
    durationSpacer: 1,
    durationHeight: DIMENSIONS.base_dimension,
};
