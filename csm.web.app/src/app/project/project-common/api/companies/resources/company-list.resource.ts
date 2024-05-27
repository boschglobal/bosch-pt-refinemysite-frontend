/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {CompanyResource} from './company.resource';

export class CompanyListResource {
    public companies: CompanyResource[];
    public _links: CompanyListResourceLinks;
}

export class CompanyListResourceLinks {
    public self: ResourceLink;
}
