/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractResource} from './abstract.resource';

export class AbstractItemSaveResource<T extends AbstractResource> {
    public id: string;
    public version: number;

    constructor(resource: T) {
        const {id, version} = resource;
        this.id = id;
        this.version = version;
    }
}
