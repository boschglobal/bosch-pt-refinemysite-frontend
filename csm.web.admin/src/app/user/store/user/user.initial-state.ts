/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {UserSlice} from './user.slice';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';

export const USER_SLICE_INITIAL_STATE: UserSlice = {
    currentItem: {
        id: null,
        requestStatus: RequestStatusEnum.Empty
    },
    authenticatedUser: {
        id: null,
        requestStatus: RequestStatusEnum.Empty
    },
    items: [],
    suggestions: []
};
