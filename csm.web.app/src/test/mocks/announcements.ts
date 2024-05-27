/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AnnouncementListResource} from '../../app/shared/alert/api/resources/announcement-list.resource';
import {AnnouncementResource} from '../../app/shared/alert/api/resources/announcement.resource';
import {AlertTypeEnum} from '../../app/shared/alert/enums/alert-type.enum';

export const ANNOUNCEMENTS_LIST_MOCK: AnnouncementListResource = {
    items: [
        new AnnouncementResource('591fffce-d4ba-4cd9-a150-ae71e23715df', AlertTypeEnum.Warning, "System under maintenance."),
        new AnnouncementResource('601fffce-d4ba-4cd9-a150-ae71e23715dg', AlertTypeEnum.Error, "Too much load in the system, please be patient.")
    ]
}
