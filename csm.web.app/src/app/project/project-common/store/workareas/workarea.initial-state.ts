/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {WorkareaSlice} from './workarea.slice';

export const WORKAREA_SLICE_INITIAL_STATE: WorkareaSlice = {
    currentItem: {
        id: null,
        requestStatus: RequestStatusEnum.empty
    },
    list: {
        ids: [],
        requestStatus: RequestStatusEnum.empty
    },
    items: [],
};
