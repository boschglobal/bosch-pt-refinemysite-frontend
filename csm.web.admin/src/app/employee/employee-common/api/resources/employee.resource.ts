/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractAuditableResource} from '../../../../shared/misc/api/resources/abstract-auditable.resource';
import {ResourceLink} from '../../../../shared/misc/api/datatypes/resource-link.datatype';
import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithEmail} from '../../../../shared/misc/api/datatypes/resource-reference-with-email.datatype';
import {EmployeeRoleEnum} from './employee-roles.enum';

export class EmployeeResource extends AbstractAuditableResource {
    public id: string;
    public name: string;
    public email: string;
    public roles: EmployeeRoleEnum[];
    public company: ResourceReference;
    public user: ResourceReferenceWithEmail;
    public _links: EmployeeResourceLinks;
}

class EmployeeResourceLinks {
    public self: ResourceLink;
    public delete?: ResourceLink;
}




