/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractPagedListResource} from '../../../../shared/misc/api/resources/abstract-paged-list.resource';
import {EmployeeResource} from './employee.resource';
import {ResourceLink} from '../../../../shared/misc/api/datatypes/resource-link.datatype';

export class EmployeeListResource extends AbstractPagedListResource {
    public items: EmployeeResource[];
    public _links: EmployeeListResourceLinks;
}

export class EmployeeListResourceLinks {
    public self: ResourceLink;
}
