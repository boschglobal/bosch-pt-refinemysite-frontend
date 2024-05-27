/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractAuditableResource} from 'src/app/shared/misc/api/resources/abstract-auditable.resource';
import {PostBoxAddress} from '../datastructures/post-box-address.datastructure';
import {ResourceLink} from '../../../../shared/misc/api/datatypes/resource-link.datatype';
import {StreetAddress} from '../datastructures/street-address.datastructure';

export class CompanyResource extends AbstractAuditableResource {
    public id: string;
    public name: string;
    public postBoxAddress?: PostBoxAddress;
    public streetAddress?: StreetAddress;
    public _links: CompanyResourceLinks;
}

class CompanyResourceLinks {
    public delete?: ResourceLink;
    public employees?: ResourceLink;
    public self: ResourceLink;
}
