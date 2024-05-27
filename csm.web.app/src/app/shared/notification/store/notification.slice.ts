/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractMarkableList} from '../../misc/api/datatypes/abstract-markable-list.datatype';
import {NotificationResource} from '../api/resources/notification.resource';
import {NotificationListLinks} from '../api/resources/notification-list.resource';

export interface NotificationSlice {
    items: NotificationResource[];
    list: AbstractMarkableList<NotificationListLinks>;
}
