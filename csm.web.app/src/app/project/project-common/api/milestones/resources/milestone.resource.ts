/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ProjectCraftResourceReference} from '../../../../../shared/misc/api/datatypes/project-craft-resource-reference.datatype';
import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {ResourceReference} from '../../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../../../../../shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {AbstractAuditableResource} from '../../../../../shared/misc/api/resources/abstract-auditable.resource';
import {MilestoneTypeEnum} from '../../../enums/milestone-type.enum';

export class MilestoneResource extends AbstractAuditableResource {
    public project: ResourceReference;
    public name: string;
    public type: MilestoneTypeEnum;
    public date: Date;
    public header: boolean;
    public creator: ResourceReferenceWithPicture;
    public position: number;
    public craft?: ProjectCraftResourceReference;
    public workArea?: ResourceReference;
    public description?: string;
    public _links: MilestoneLinks;
}

export class MilestoneLinks {
    public self: ResourceLink;
    public update?: ResourceLink;
    public delete?: ResourceLink;
}
