/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractPagedListResource} from '../../../shared/misc/api/resources/abstract-paged-list.resource';
import {EmployableUserResource} from './employable-user.resource';
import {ResourceLink} from '../../../shared/misc/api/datatypes/resource-link.datatype';

export class EmployableUserListResource extends AbstractPagedListResource {
    public items: EmployableUserResource[];
    public _links: EmployableUserResourceListLinks;
}

export class EmployableUserResourceListLinks {
    public self: ResourceLink;
}
