/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {ProjectCraftResourceReference} from '../../../../shared/misc/api/datatypes/project-craft-resource-reference.datatype';
import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../../../../shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {AbstractAuditableResource} from '../../../../shared/misc/api/resources/abstract-auditable.resource';
import {MilestoneResource} from '../../api/milestones/resources/milestone.resource';
import {MilestoneTypeEnum} from '../../enums/milestone-type.enum';

interface MilestonePermissions {
    canUpdate: boolean;
    canDelete: boolean;
}

export class Milestone extends AbstractAuditableResource {
    public project: ResourceReference;
    public name: string;
    public type: MilestoneTypeEnum;
    public date: moment.Moment;
    public header: boolean;
    public creator: ResourceReferenceWithPicture;
    public position: number;
    public craft?: ProjectCraftResourceReference;
    public workArea?: ResourceReference;
    public description?: string;
    public permissions: MilestonePermissions;

    public static fromMilestoneResource(milestoneResource: MilestoneResource): Milestone {
        if (!milestoneResource) {
            return null;
        }

        const {
            id,
            version,
            createdBy,
            createdDate,
            lastModifiedBy,
            lastModifiedDate,
            project,
            name,
            type,
            date,
            header,
            creator,
            position,
            craft,
            workArea,
            description
        } = milestoneResource;

        return {
            id,
            version,
            createdBy,
            createdDate,
            lastModifiedBy,
            lastModifiedDate,
            project,
            name,
            type,
            date: moment(date),
            header,
            creator,
            position,
            craft,
            workArea,
            description,
            permissions: Milestone.mapLinksToPermissions(milestoneResource)
        };

    }

    private static mapLinksToPermissions(milestoneResource: MilestoneResource): MilestonePermissions {
        const links = milestoneResource._links;

        return {
            canUpdate: links.hasOwnProperty('update'),
            canDelete: links.hasOwnProperty('delete'),
        };
    }
}
