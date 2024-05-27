/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {AbstractPagedListResource} from '../../../../shared/misc/api/resources/abstract-paged-list.resource';
import {ProjectResource} from './project.resource';
import {ResourceLink} from '../../../../shared/misc/api/datatypes/resource-link.datatype';

export class ProjectListResource extends AbstractPagedListResource {
    public projects: ProjectResource[];
    public userActivated: boolean;
    public _links: ProjectListLinks;
}

export class ProjectListLinks {
    self: ResourceLink;
}
