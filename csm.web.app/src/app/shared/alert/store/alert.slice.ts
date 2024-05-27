/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {AlertResource} from '../api/resources/alert.resource';
import {AnnouncementResource} from '../api/resources/announcement.resource';

/*
 TODO: SMAR-9598 [Web] Refactor Alerts to Toasts and extend functionality

  "alerts" should be soon refactored to "toasts" to ensure consistency with the name defined by the design team
  and to create less confusion between the name of the slice and what it actually saves. Being the objective to save
  many kinds of alerts types and reduce boilerplate. :D
 */
export interface AlertSlice {
    alerts: AlertResource[];
    announcements: AnnouncementResource[];
    readAnnouncements: string[];
}
