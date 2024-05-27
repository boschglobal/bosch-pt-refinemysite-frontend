/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../misc/enums/request-status.enum';
import {JobSlice} from './job.slice';

export const JOB_SLICE_INITIAL_STATE: JobSlice = {
    items: [],
    list: {
        ids: [],
        requestStatus: RequestStatusEnum.empty,
        lastSeen: null,
        lastAdded: null,
    },
    watchingIds: [],
};
