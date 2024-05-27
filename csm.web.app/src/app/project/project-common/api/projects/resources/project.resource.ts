/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Address} from '../../../../../shared/misc/api/datatypes/address.datatype';
import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {ResourceReference} from '../../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {AbstractAuditableResource} from '../../../../../shared/misc/api/resources/abstract-auditable.resource';
import {ProjectCategoryEnum} from '../../../enums/project-category.enum';
import {ProjectConstructionSiteManagerResource} from './project-construction-site-manager.resource';
import {ProjectPictureResource} from './project-picture.resource';

export class ProjectResource extends AbstractAuditableResource {
    public title: string;
    public projectNumber: string;
    public start: Date;
    public end: Date;
    public address: Address;
    public company: ResourceReference;
    public constructionSiteManager: ProjectConstructionSiteManagerResource;
    public participants: number;
    public _links: ProjectResourceLinks;
    public category?: ProjectCategoryEnum;
    public client?: string;
    public description?: string;
    public _embedded?: ProjectResourceEmbeddeds;
}

class ProjectResourceLinks {
    public self: ResourceLink;
    public calendarCustomSort?: ResourceLink;
    public createCraftMilestone?: ResourceLink;
    public createInvestorMilestone?: ResourceLink;
    public createProjectMilestone?: ResourceLink;
    public export?: ResourceLink;
    public import?: ResourceLink;
    public participants?: ResourceLink;
    public projectCrafts?: ResourceLink;
    public reschedule?: ResourceLink;
    public tasks?: ResourceLink;
    public update?: ResourceLink;
    public updateConstraints?: ResourceLink;
    public updateRfv?: ResourceLink;
    public updateWorkdays?: ResourceLink;
    public workAreas?: ResourceLink;
}

class ProjectResourceEmbeddeds {
    public statistics: ProjectStatistics;
    public projectPicture?: ProjectPictureResource;
}

export class ProjectStatistics {
    public acceptedTasks: number;
    public draftTasks: number;
    public openTasks: number;
    public closedTasks: number;
    public startedTasks: number;
    public criticalTopics: number;
    public uncriticalTopics: number;
}
