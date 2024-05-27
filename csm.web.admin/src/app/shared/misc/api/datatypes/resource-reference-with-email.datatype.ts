/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceReference} from './resource-reference.datatype';

export class ResourceReferenceWithEmail extends ResourceReference {
    public email: string;
    public id: string;
    public displayName: string;

    constructor(id: string, displayName: string, email: string) {
        super(id, displayName);
        this.email = email;
    }
}
