/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';
import {AbstractPagedListResource} from '../../../../../shared/misc/api/resources/abstract-paged-list.resource';
import {RelationResource} from './relation.resource';

export class RelationListResource extends AbstractPagedListResource {
    public items: RelationResource[];
    public _links: RelationListLinks;
}

export class RelationListLinks {
    public self: ResourceLink;
}
