/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    HttpClient,
    HttpHeaders,
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {ApiUrlHelper} from '../../../../shared/rest/helpers/api-url.helper';
import {ProjectCraftResource} from './resources/project-craft.resource';
import {ProjectCraftListResource} from './resources/project-craft-list.resource';
import {SaveProjectCraftResource} from './resources/save-project-craft.resource';
import {SaveProjectCraftListResource} from './resources/save-project-craft-list.resource';

@Injectable({
    providedIn: 'root',
})
export class ProjectCraftService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Retrieve all the crafts of a determined project
     * @param {string} projectId
     * @returns {Observable<ProjectCraftListResource>}
     */
    public findAll(projectId: string): Observable<ProjectCraftListResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/crafts`)
            .build();

        return this._httpClient.get<ProjectCraftListResource>(url);
    }

    /**
     * @description Create craft request
     * @param projectId
     * @param {ProjectCraftResource} craft
     * @param {string} version
     * @returns {Observable<Object>}
     */
    public create(projectId: string, craft: SaveProjectCraftResource, version: number): Observable<ProjectCraftListResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/crafts`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.post<ProjectCraftListResource>(url, craft, {headers});
    }

    /**
     * @description Deletes a craft with given id
     * @param projectId
     * @param craftId
     * @param {number} version
     * @returns {Observable<{}>}
     */
    public delete(projectId: string, craftId: string, version: number): Observable<ProjectCraftListResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/crafts/${craftId}`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.delete<ProjectCraftListResource>(url, {headers});
    }

    /**
     * @description Update craft
     * @param projectId
     * @param {string} craftId
     * @param {ProjectCraftResource} craft
     * @param {number} version
     * @returns {Observable<Object>}
     */
    public update(projectId: string, craftId: string, craft: SaveProjectCraftResource, version: number): Observable<ProjectCraftResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/crafts/${craftId}`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.put<ProjectCraftResource>(url, craft, {headers});
    }

    /**
     * @description Update craft list reordering crafts with given id to new position
     * @param projectId
     * @param {SaveProjectCraftListResource} craft
     * @param {string} version
     * @returns {Observable<ProjectCraftListResource>}
     */
    public updateList(projectId: string, craft: SaveProjectCraftListResource, version: number): Observable<ProjectCraftListResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/crafts`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.put<ProjectCraftListResource>(url, craft, {headers});
    }
}
