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

export const DAY_CARD_STATUS_EMPTY = 'empty';
export const DAY_CARD_STATUS_UNAVAILABLE = 'unavailable';
export const DAY_CARD_INDICATORS_ICON: { [s: string]: IconModel } = {
    [DayCardStatusEnum.NotDone]: {
        name: 'status-indicator-not-done',
        color: COLORS.red
    },
    [DayCardStatusEnum.Done]: {
        name: 'status-indicator-done',
        color: COLORS.light_green
    },
    [DayCardStatusEnum.Approved]: {
        name: 'status-indicator-approved',
        color: COLORS.light_green
    },
    [DayCardStatusEnum.Open]: {
        name: 'status-indicator-planned',
        color: COLORS.dark_grey_75
    },
    [DAY_CARD_STATUS_UNAVAILABLE]: {
        name: 'status-indicator-unavailable',
        color: COLORS.light_grey
    },
    [DAY_CARD_STATUS_EMPTY]: {
        name: 'status-indicator-empty',
        color: COLORS.light_grey
    }
};
