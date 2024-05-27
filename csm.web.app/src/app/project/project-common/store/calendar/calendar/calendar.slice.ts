/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {CalendarUserSettings} from '../../../api/calendar/resources/calendar-user-settings';

export interface CalendarSlice {
    exportRequestStatus: RequestStatusEnum;
    userSettings: CalendarUserSettings;
}
