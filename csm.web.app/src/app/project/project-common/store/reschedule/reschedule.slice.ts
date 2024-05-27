/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {RescheduleResource} from '../../api/reschedule/resources/reschedule.resource';

export interface RescheduleSlice {
    item: RescheduleResource;
    requestStatus: RequestStatusEnum;
}
