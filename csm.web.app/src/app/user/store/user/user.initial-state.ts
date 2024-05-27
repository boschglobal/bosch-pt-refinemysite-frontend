/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {UserSlice} from './user.slice';

export const USER_SLICE_INITIAL_STATE: UserSlice = {
    currentItem: {
        id: null,
        requestStatus: RequestStatusEnum.empty,
        dataRequestStatus: RequestStatusEnum.empty,
        pictureRequestStatus: RequestStatusEnum.empty,
    },
    items: [],
    privacySettings: null,
};
