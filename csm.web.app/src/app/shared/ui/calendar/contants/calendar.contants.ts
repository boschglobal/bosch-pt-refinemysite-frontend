/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {DIMENSIONS} from '../../constants/dimensions.constant';

const daycardWidth = DIMENSIONS.base_dimension__x9;

export const CALENDAR_CONSTANTS = {
    daycardWidth,
    weekWidth: 154,
    weekSpacer: DIMENSIONS.base_dimension__x2,
    expandedWeekWidth: daycardWidth * 7,
    leftColumnWidth: 240,
    resizeDebounceTime: 300,
};
