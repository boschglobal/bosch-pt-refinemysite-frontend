/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {AbstractPagedListResource} from '../../../../../shared/misc/api/resources/abstract-paged-list.resource';
import {MilestoneResource} from './milestone.resource';

export class MilestoneListResource extends AbstractPagedListResource {
    public items: MilestoneResource[];
    public _links: MilestoneListLinks;
}

export class MilestoneListLinks {
    public self: ResourceLink;
    public createCraftMilestone: ResourceLink;
    public createInvestorMilestone: ResourceLink;
    public createProjectMilestone: ResourceLink;
}
