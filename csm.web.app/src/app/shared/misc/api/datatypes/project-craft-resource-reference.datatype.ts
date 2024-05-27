/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceReference} from './resource-reference.datatype';

export class ProjectCraftResourceReference extends ResourceReference {
    public color: string;

    constructor(id: string, displayName: string, color: string) {
        super(id, displayName);
        this.color = color;
    }
}
