/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceReference} from './resource-reference.datatype';

export class ResourceReferenceWithPicture extends ResourceReference {
    public picture: string;

    constructor(id: string, displayName: string, picture: string) {
        super(id, displayName);
        this.picture = picture;
    }
}
