/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {PATSlice} from './pat.slice';

export const PAT_SLICE_INITIAL_STATE: PATSlice = {
    currentItem: {
        id: null,
        requestStatus: RequestStatusEnum.empty,
    },
    items: [],
    list: {
        ids: [],
        requestStatus: RequestStatusEnum.empty,
    },
};
