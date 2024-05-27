/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {CalendarSelectionSlice} from './calendar-selection.slice';

export const CALENDAR_SELECTION_SLICE_INITIAL_STATE: CalendarSelectionSlice = {
    items: [],
    context: null,
    isMultiSelecting: false,
    action: null,
};
