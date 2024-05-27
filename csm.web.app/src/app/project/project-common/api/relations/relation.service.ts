/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    HttpClient,
    HttpHeaders,
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {AbstractItemsResource} from '../../../../shared/misc/api/resources/abstract-items.resource';
import {ApiUrlHelper} from '../../../../shared/rest/helpers/api-url.helper';
import {RelationResource} from './resources/relation.resource';
import {RelationListResource} from './resources/relation-list.resource';
import {SaveRelationResource} from './resources/save-relation.resource';
import {SaveRelationFilters} from './resources/save-relation-filters';

@Injectable({
    providedIn: 'root',
})
export class RelationService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Retrieves relation with given relationId
     * @param {string} projectId
     * @param {string} relationId
     * @returns {Observable<RelationResource>}
     */
    public findOne(projectId: string, relationId: string): Observable<RelationResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/relations/${relationId}`)
            .build();

        return this._httpClient.get<RelationResource>(url);
    }

    /**
     * @description Retrieves all relations with
     * @param {string} projectId
     * @param {number} pageNumber
     * @param {number} size
     * @param {SaveRelationFilters} filters
     * @returns {Observable<RelationListResource>}
     */
    public findAll(projectId: string, pageNumber: number, size: number, filters: SaveRelationFilters): Observable<RelationListResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/relations/search`)
            .withPagination(size, pageNumber)
            .build();

        return this._httpClient.post<RelationListResource>(url, filters);
    }

    /**
     * @description Retrieves all relations by ids
     * @param {string} projectId
     * @param {string[]} ids
     * @returns {Observable<RelationResource[]>}
     */
    public findAllByIds(projectId: string, ids: string[]): Observable<AbstractItemsResource<RelationResource>> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/relations/batch/find`)
            .build();

        return this._httpClient.post<AbstractItemsResource<RelationResource>>(url, {ids});
    }

    /**
     * @description Create relation
     * @param {string} projectId
     * @param {SaveRelationResource} relation
     * @returns {Observable<RelationResource>}
     */
    public create(projectId: string, relation: SaveRelationResource): Observable<RelationResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/relations`)
            .build();

        return this._httpClient.post<RelationResource>(url, relation);
    }

    /**
     * @description Create multiple relations
     * @param {string} projectId
     * @param {SaveRelationResource[]} relations
     * @returns {Observable<RelationResource[]>}
     */
    public createAll(projectId: string, relations: SaveRelationResource[]): Observable<RelationResource[]> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/relations/batch/create`)
            .build();
        const abstractItemsResource = new AbstractItemsResource(relations);

        return this._httpClient
            .post<RelationListResource>(url, abstractItemsResource)
            .pipe(
                map(response => response.items));
    }

    /**
     * @description Delete relation with given relationId
     * @param {string} projectId
     * @param {string} relationId
     * @param {number} version
     * @returns {Observable<void>}
     */
    public delete(projectId: string, relationId: string, version: number): Observable<void> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/relations/${relationId}`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.delete<void>(url, {headers});
    }
}
