/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

export abstract class AbstractPagedListResource {
    public pageNumber: number;
    public pageSize: number;
    public totalElements: number;
    public totalPages: number;
}
