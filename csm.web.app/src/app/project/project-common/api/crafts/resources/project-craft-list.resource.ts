/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {ProjectCraftResource} from './project-craft.resource';

export class ProjectCraftListResource {
    public projectCrafts: ProjectCraftResource[];
    public version: number;
    public _links: ProjectCraftListLinks;
}

export class ProjectCraftListLinks {
    public self: ResourceLink;
    public create?: ResourceLink;
}
