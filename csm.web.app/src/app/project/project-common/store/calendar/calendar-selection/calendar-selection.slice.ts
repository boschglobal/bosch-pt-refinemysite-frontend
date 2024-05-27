/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {ObjectIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {CalendarSelectionActionEnum} from '../../../enums/calendar-selection-action.enum';
import {CalendarSelectionContextEnum} from '../../../enums/calendar-selection-context.enum';

export interface CalendarSelectionSlice {
    items: ObjectIdentifierPair[];
    context?: CalendarSelectionContextEnum;
    isMultiSelecting: boolean;
    action: CalendarSelectionActionEnum;
}
