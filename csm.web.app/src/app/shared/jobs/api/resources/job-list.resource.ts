/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../misc/api/datatypes/resource-link.datatype';
import {AbstractPagedListResource} from '../../../misc/api/resources/abstract-paged-list.resource';
import {JobResource} from './job.resource';

export class JobListResource extends AbstractPagedListResource {
    public items: JobResource[];
    public lastSeen?: string;
    public _links: JobListLinks;
}

export class JobListLinks {
    self: ResourceLink;
}
