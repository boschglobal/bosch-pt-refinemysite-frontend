/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ColorHelper} from '../../../shared/misc/helpers/color.helper';
import {COLORS} from '../../../shared/ui/constants/colors.constant';
import {RfvKey} from '../api/rfvs/resources/rfv.resource';

export const REASONS_FOR_VARIANCE_COLORS: Record<RfvKey, ReasonsForVarianceColorModel> = {
    ['OPEN']: {
        normal: COLORS.dark_grey,
        faded: ColorHelper.getColorWithAlpha(COLORS.dark_grey),
    },
    ['CHANGED_PRIORITY']: {
        normal: COLORS.yellow,
        faded: ColorHelper.getColorWithAlpha(COLORS.yellow),
    },
    ['MISSING_TOOLS']: {
        normal: COLORS.red,
        faded: ColorHelper.getColorWithAlpha(COLORS.red),
    },
    ['CONCESSION_NOT_RECOGNIZED']: {
        normal: COLORS.dark_red,
        faded: ColorHelper.getColorWithAlpha(COLORS.dark_red),
    },
    ['DELAYED_MATERIAL']: {
        normal: COLORS.dark_blue,
        faded: ColorHelper.getColorWithAlpha(COLORS.dark_blue),
    },
    ['MANPOWER_SHORTAGE']: {
        normal: COLORS.light_blue,
        faded: ColorHelper.getColorWithAlpha(COLORS.light_blue),
    },
    ['TOUCHUP']: {
        normal: COLORS.turquoise,
        faded: ColorHelper.getColorWithAlpha(COLORS.turquoise),
    },
    ['MISSING_INFOS']: {
        normal: COLORS.dark_green,
        faded: ColorHelper.getColorWithAlpha(COLORS.dark_green),
    },
    ['OVERESTIMATION']: {
        normal: COLORS.purple,
        faded: ColorHelper.getColorWithAlpha(COLORS.purple),
    },
    ['BAD_WEATHER']: {
        normal: COLORS.violet,
        faded: ColorHelper.getColorWithAlpha(COLORS.violet),
    },
    ['NO_CONCESSION']: {
        normal: COLORS.magenta,
        faded: ColorHelper.getColorWithAlpha(COLORS.magenta),
    },
    ['CUSTOM1']: {
        normal: COLORS.dark_turquoise,
        faded: ColorHelper.getColorWithAlpha(COLORS.dark_turquoise),
    },
    ['CUSTOM2']: {
        normal: COLORS.orange,
        faded: ColorHelper.getColorWithAlpha(COLORS.orange),
    },
    ['CUSTOM3']: {
        normal: COLORS.brown,
        faded: ColorHelper.getColorWithAlpha(COLORS.brown),
    },
    ['CUSTOM4']: {
        normal: COLORS.salmon,
        faded: ColorHelper.getColorWithAlpha(COLORS.salmon),
    },
};

export interface ReasonsForVarianceColorModel {
    normal: string;
    faded?: string;
}
