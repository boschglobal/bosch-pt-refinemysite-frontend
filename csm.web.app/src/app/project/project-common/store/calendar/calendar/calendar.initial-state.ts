/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {CalendarUserSettings} from '../../../api/calendar/resources/calendar-user-settings';
import {CalendarSlice} from './calendar.slice';

export const CALENDAR_SLICE_INITIAL_STATE: CalendarSlice = {
    exportRequestStatus: RequestStatusEnum.empty,
    userSettings: new CalendarUserSettings(),
};
