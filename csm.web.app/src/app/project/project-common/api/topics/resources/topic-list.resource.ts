/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {ResourceLinkTemplated} from '../../../../../shared/misc/api/datatypes/resource-link-templated.datatype';
import {TopicResource} from './topic.resource';

export class TopicListResource {
    public topics: TopicResource[];
    public _links: TopicListLinks;
}

export class TopicListLinks {
    self: ResourceLinkTemplated;
    prev?: ResourceLink;
}
