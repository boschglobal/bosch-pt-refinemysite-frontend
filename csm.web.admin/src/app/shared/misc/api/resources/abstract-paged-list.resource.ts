/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

export abstract class AbstractPagedListResource {
    public pageNumber: number;
    public pageSize: number;
    public totalElements: number;
    public totalPages: number;
}
