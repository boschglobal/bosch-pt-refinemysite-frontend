/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

export class ResourceReference {
    public id: string;
    public displayName: string;

    constructor(id: string, displayName: string) {
        this.id = id;
        this.displayName = displayName;
    }
}
