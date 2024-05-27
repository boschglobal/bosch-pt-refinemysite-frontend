/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';

export class CompanyResource {
    public id: string;
    public name: string;
    public _links: CompanyResourceLinks;
}
class CompanyResourceLinks {
    public self: ResourceLink;
}
