/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ProjectSlice} from './project.slice';

export const PROJECT_SLICE_INITIAL_STATE: ProjectSlice = {
    userActivated: false,
    currentItem: {
        dataRequestStatus: RequestStatusEnum.empty,
        pictureRequestStatus: RequestStatusEnum.empty,
        id: null,
        requestStatus: RequestStatusEnum.empty
    },
    list: {
        ids: [],
        requestStatus: RequestStatusEnum.empty
    },
    items: [],
};
