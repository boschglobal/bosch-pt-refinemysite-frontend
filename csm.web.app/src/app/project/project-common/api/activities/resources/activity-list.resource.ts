/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceLinkTemplated} from '../../../../../shared/misc/api/datatypes/resource-link-templated.datatype';
import {ActivityResource} from './activity.resource';

export class ActivityListResource {
    public activities: ActivityResource[];
    public _links: ActivityListResourceLinks;
}

export class ActivityListResourceLinks {
    public self: ResourceLinkTemplated;
    public prev: ResourceLinkTemplated;
}
