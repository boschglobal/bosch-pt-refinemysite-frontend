/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceLink} from '../datatypes/resource-link.datatype';

export class AbstractItemsResource<T> {
    public items: T[];
    public _links: AbstractItemsResourceLinks;

    constructor(items: T[]) {
        this.items = items;
    }
}

export class AbstractItemsResourceLinks {
    public self: ResourceLink;
}
