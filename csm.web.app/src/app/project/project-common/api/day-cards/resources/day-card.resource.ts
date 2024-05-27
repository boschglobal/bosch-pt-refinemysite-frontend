/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NamedEnumReference} from '../../../../../shared/misc/api/datatypes/named-enum-reference.datatype';
import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {ResourceReference} from '../../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {AbstractAuditableResource} from '../../../../../shared/misc/api/resources/abstract-auditable.resource';
import {DayCardStatusEnum} from '../../../enums/day-card-status.enum';
import {RfvKey} from '../../rfvs/resources/rfv.resource';

export class DayCardResource extends AbstractAuditableResource {
    public title: string;
    public manpower: number;
    public notes?: string;
    public status: DayCardStatusEnum;
    public reason?: NamedEnumReference<RfvKey>;
    public task: ResourceReference;
    public _links: DayCardLinks;
}

class DayCardLinks {
    public self: ResourceLink;
    public delete?: ResourceLink;
    public update?: ResourceLink;
    public cancel?: ResourceLink;
    public complete?: ResourceLink;
    public approve?: ResourceLink;
    public reset?: ResourceLink;
}
