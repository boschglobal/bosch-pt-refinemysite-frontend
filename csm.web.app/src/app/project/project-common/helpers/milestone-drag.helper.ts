/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';

import {CalendarMilestone} from '../../../shared/ui/calendar/calendar/calendar.component';
import {DragDropHelper} from './drag-drop.helper';

@Injectable({
    providedIn: 'root'
})
export class MilestoneDragHelper extends DragDropHelper<CalendarMilestone> {
}
