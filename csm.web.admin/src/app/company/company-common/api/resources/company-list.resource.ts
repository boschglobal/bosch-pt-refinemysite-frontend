/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractPagedListResource} from '../../../../shared/misc/api/resources/abstract-paged-list.resource';
import {CompanyResource} from './company.resource';
import {ResourceLink} from '../../../../shared/misc/api/datatypes/resource-link.datatype';

export class CompanyListResource extends AbstractPagedListResource {
    public items: CompanyResource[];
    public _links: CompanyListResourceLinks;
}

export class CompanyListResourceLinks {
    public self: ResourceLink;
}
