/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {RfvSlice} from './rfv.slice';

export const RFV_SLICE_INITIAL_STATE: RfvSlice = {
    items: [],
    list: {
        ids: [],
        requestStatus: RequestStatusEnum.empty,
    },
};
