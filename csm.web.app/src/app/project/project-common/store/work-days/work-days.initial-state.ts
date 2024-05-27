/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {WorkDaysResource} from '../../api/work-days/resources/work-days.resource';
import {WorkDaysSlice} from './work-days.slice';

export const WORK_DAYS_INITIAL_STATE: WorkDaysSlice = {
    item: new WorkDaysResource(),
    requestStatus: RequestStatusEnum.empty,
};
