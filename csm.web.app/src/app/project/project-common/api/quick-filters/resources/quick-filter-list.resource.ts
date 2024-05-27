/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {QuickFilterResource} from './quick-filter.resource';

export class QuickFilterListResource {
    public items: QuickFilterResource[];
    public _links: QuickFilterListLinks;
}

export class QuickFilterListLinks {
    public self: ResourceLink;
    public create?: ResourceLink;
}
