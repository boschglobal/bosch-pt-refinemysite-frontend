/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {CalendarScopeParameters} from '../slice/calendar.scope-parameters';
import {CalendarScopeSlice} from './calendar-scope.slice';

export const CALENDAR_SCOPE_SLICE_INITIAL_STATE: CalendarScopeSlice = {
    expandedWeeks: [],
    focus: null,
    focusResolveStatus: RequestStatusEnum.empty,
    navigateToElement: null,
    scopeParameters: new CalendarScopeParameters(),
};
