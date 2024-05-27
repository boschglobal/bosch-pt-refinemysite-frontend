/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {COLORS} from '../../../shared/ui/constants/colors.constant';
import {IconModel} from '../../../shared/ui/icons/icon.component';
import {DayCardStatusEnum} from '../enums/day-card-status.enum';

export const DAY_CARD_STATUS_ICON: { [s: string]: IconModel } = {
    [DayCardStatusEnum.NotDone]: {
        name: 'day-card-status-notdone-frame',
        color: COLORS.red,
    },
    [DayCardStatusEnum.Done]: {
        name: 'day-card-status-done-frame',
        color: COLORS.light_green,
    },
    [DayCardStatusEnum.Approved]: {
        name: 'day-card-status-approved-filled',
        color: COLORS.light_green,
    },
    [DayCardStatusEnum.Open]: {
        name: 'day-card-status-open-frame',
        color: COLORS.dark_grey_75,
    },
};
