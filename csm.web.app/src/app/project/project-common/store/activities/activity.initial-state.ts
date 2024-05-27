/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ActivitySlice} from './activity.slice';

export const ACTIVITY_SLICE_INITIAL_STATE: ActivitySlice = {
    items: [],
    list: {
        ids: [],
        requestStatus: RequestStatusEnum.empty
    }
};
