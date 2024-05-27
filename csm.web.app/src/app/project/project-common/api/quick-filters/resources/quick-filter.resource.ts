/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {AbstractAuditableResource} from '../../../../../shared/misc/api/resources/abstract-auditable.resource';
import {ProjectFiltersCriteriaResource} from '../../misc/resources/project-filters-criteria.resource';

export class QuickFilterResource extends AbstractAuditableResource {
    public name: string;
    public criteria: ProjectFiltersCriteriaResource;
    public useMilestoneCriteria: boolean;
    public useTaskCriteria: boolean;
    public highlight: boolean;
    public _links: QuickFilterLinks;
}

export class QuickFilterLinks {
    public update?: ResourceLink;
    public delete?: ResourceLink;
}
