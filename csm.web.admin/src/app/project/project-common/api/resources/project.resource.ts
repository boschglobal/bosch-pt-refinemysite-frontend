/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {AbstractAuditableResource} from '../../../../shared/misc/api/resources/abstract-auditable.resource';
import {Address} from '../../../../shared/misc/api/datatypes/address.datatype';
import {ResourceLink} from '../../../../shared/misc/api/datatypes/resource-link.datatype';
import {ProjectCategoryEnum} from '../../enums/project-category.enum';
import {ProjectConstructionSiteManagerResource} from './project-construction-site-manager.resource';
import {ProjectPictureResource} from './project-picture.resource';

export class ProjectResource extends AbstractAuditableResource {
    public title: string;
    public start: Date;
    public end: Date;
    public address: Address;
    public company: ResourceReference;
    public constructionSiteManager: ProjectConstructionSiteManagerResource;
    public client?: string;
    public description?: string;
    public participants: number;
    public projectNumber: string;
    public category?: ProjectCategoryEnum;
    public _links: ProjectResourceLinks;
    public _embedded?: ProjectResourceEmbedded;
}

class ProjectResourceLinks {
    public self: ResourceLink;
    public createCraftMilestone?: ResourceLink;
    public createInvestorMilestone?: ResourceLink;
    public createProjectMilestone?: ResourceLink;
    public delete?: ResourceLink;
    public tasks?: ResourceLink;
    public update?: ResourceLink;
    public participants?: ResourceLink;
    public projectCrafts?: ResourceLink;
    public workAreas?: ResourceLink;
}

class ProjectResourceEmbedded {
    public projectPicture?: ProjectPictureResource;
}
