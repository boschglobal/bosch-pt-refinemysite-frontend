/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

export class AbstractIdsSaveResource {
    public ids: string[];

    constructor(ids: string[]) {
        this.ids = ids;
    }
}
