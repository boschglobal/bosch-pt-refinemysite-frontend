/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../shared/misc/api/datatypes/resource-link.datatype';
import {ResourceReference} from '../../../shared/misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithEmail} from '../../../shared/misc/api/datatypes/resource-reference-with-email.datatype';

export class EmployableUserResource {
    public user: EmployeeUser;
    public employee?: ResourceReference;
    public company?: ResourceReference;
    public _links: EmployableUserResourceLinks;
}

export class EmployeeUser extends ResourceReferenceWithEmail {
    admin: boolean;
    createdAt: string;
    gender: string;
}

export class EmployableUserResourceLinks {
    editEmployee: ResourceLink;
    createEmployee: ResourceLink;
    deleteUser: ResourceLink;
    setAdmin: ResourceLink;
    unsetAdmin: ResourceLink;
}
