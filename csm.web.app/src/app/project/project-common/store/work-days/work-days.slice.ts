/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {WorkDaysResource} from '../../api/work-days/resources/work-days.resource';

export interface WorkDaysSlice {
    item: WorkDaysResource;
    requestStatus: RequestStatusEnum;
}
