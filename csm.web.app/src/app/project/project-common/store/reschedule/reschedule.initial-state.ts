/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {RescheduleSlice} from './reschedule.slice';

export const RESCHEDULE_SLICE_INITIAL_STATE: RescheduleSlice = {
    requestStatus: RequestStatusEnum.empty,
    item: null,
};
