/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {COLORS} from '../../../shared/ui/constants/colors.constant';

export const PROJECT_KPIS_COLOR_RANGES = [
    {min: 0, max: 49, color: COLORS.red},
    {min: 50, max: 79, color: COLORS.yellow},
    {min: 80, max: 99, color: COLORS.light_green},
    {min: 100, max: 100, color: COLORS.black},
];
