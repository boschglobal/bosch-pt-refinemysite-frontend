/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../misc/enums/request-status.enum';
import {NotificationSlice} from './notification.slice';

export const NOTIFICATION_SLICE_INITIAL_STATE: NotificationSlice = {
    items: [],
    list: {
        ids: [],
        requestStatus: RequestStatusEnum.empty,
        lastSeen: null,
        lastAdded: null,
    }
};
