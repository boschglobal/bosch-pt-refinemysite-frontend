/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {AbstractPagedListResource} from '../../../../../shared/misc/api/resources/abstract-paged-list.resource';
import {ProjectParticipantResource} from './project-participant.resource';

export class ProjectParticipantListResource extends AbstractPagedListResource {
    public items: ProjectParticipantResource[];
    public _links: ProjectParticipantListLinks;
}

export class ProjectParticipantListLinks {
    public self: ResourceLink;
    public assign?: ResourceLink;
    public delete?: ResourceLink;
}
