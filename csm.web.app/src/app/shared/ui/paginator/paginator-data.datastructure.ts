/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

export class PaginatorData {
    public entries: number;
    public items: number;
    public page: number;

    constructor(items = 100, page = 0, entries = 0) {
        this.items = items;
        this.page = page;
        this.entries = entries;
    }
}
