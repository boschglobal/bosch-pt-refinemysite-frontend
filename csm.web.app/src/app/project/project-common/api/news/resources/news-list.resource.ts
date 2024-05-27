/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceLinkTemplated} from '../../../../../shared/misc/api/datatypes/resource-link-templated.datatype';
import {NewsResource} from './news.resource';

export class NewsListResource {
    public items: NewsResource[];
    public _links: NewsListResourceLinks;
}

export class NewsListResourceLinks {
    public self: ResourceLinkTemplated;
}
