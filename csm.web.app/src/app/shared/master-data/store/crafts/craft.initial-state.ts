/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../misc/enums/request-status.enum';
import {CraftSlice} from './craft.slice';

export const CRAFT_SLICE_INITIAL_STATE: CraftSlice = {
    used: false,
    list: {
        en: [],
        de: [],
        es: [],
        pt: [],
        fr: [],
    },
    requestStatus: RequestStatusEnum.empty,
};
