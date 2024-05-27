/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

export class PaginatorData {
    public pageNumber: number;
    public pageSize: number;
    public totalElements: number;
    public totalPages: number;

    constructor(pageSize = 25, pageNumber = 0, totalElements = 0, totalPages = 0) {
        this.pageSize = pageSize;
        this.pageNumber = pageNumber;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
    }
}
