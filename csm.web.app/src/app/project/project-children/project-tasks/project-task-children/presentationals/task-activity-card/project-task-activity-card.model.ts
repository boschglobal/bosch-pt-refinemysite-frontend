/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceReferenceActivity} from '../../../../../project-common/api/activities/resources/activity.resource';
import {AttachmentResource} from '../../../../../project-common/api/attachments/resources/attachment.resource';

export interface ProjectTaskActivityCardModel {
    title: string[] | ResourceReferenceActivity[];
    content?: string[];
    activityDate: string;
    userPicture: string;
    attachment?: {
        link: string,
        fileName: string
    };
    thumbnail?: AttachmentResource;
    isNew?: boolean;
}
