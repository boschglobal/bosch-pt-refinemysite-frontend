/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */
import {ResourceLink} from '../../../shared/misc/api/datatypes/resource-link.datatype';
import {CraftResource} from './craft.resource';

export class CraftListResource {
    public crafts: CraftResource[];
    public _links: CraftListResourceLinks;
}

export class CraftListResourceLinks {
    public self: ResourceLink;
}
