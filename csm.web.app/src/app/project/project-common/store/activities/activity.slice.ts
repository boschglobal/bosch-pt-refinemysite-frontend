/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {ActivityResource} from '../../api/activities/resources/activity.resource';
import {ActivityListResourceLinks} from '../../api/activities/resources/activity-list.resource';

export interface ActivitySlice {
    items: ActivityResource[];
    list: AbstractList<ActivityListResourceLinks>;
}
