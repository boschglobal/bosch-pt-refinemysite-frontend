/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */
import {ResourceLink} from '../../../shared/misc/api/datatypes/resource-link.datatype';

export class CraftResource {
    public id: string;
    public name: string;
    public _links: CraftResourceLinks;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
}

class CraftResourceLinks {
    public self: ResourceLink;
}
