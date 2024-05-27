/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    HttpClient,
    HttpHeaders
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {ApiUrlHelper} from '../../../../shared/rest/helpers/api-url.helper';
import {ProjectResource} from './resources/project.resource';
import {ProjectListResource} from './resources/project-list.resource';
import {SaveProjectResource} from './resources/save-project.resource';

@Injectable({
    providedIn: 'root',
})
export class ProjectService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Find a single project
     * @param {string} id
     * @returns {Observable<ProjectResource>}
     */
    public findOne(id: string): Observable<ProjectResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${id}`)
            .build();

        return this._httpClient.get<ProjectResource>(url);

    }

    /**
     * @description Find all projects
     * @param {number} pageNumber
     * @param {number} size
     * @returns {Observable<ProjectListResource>}
     */
    public findAll(pageNumber: number, size: number): Observable<ProjectListResource> {
        const url = this._apiUrlHelper
            .withPath('projects')
            .withPagination(size, pageNumber)
            .build();

        return this._httpClient.get<ProjectListResource>(url);
    }

    /**
     * @description Create project request
     * @param project
     * @returns {Observable<ProjectResource>}
     */
    public create(project: SaveProjectResource): Observable<ProjectResource> {
        const url = this._apiUrlHelper
            .withPath('projects')
            .build();

        return this._httpClient.post<ProjectResource>(url, project);
    }

    /**
     * @description Update project details
     * @param {SaveProjectResource} project
     * @param {string} id
     * @param {string} version
     * @returns {Observable<ProjectResource>}
     */
    public update(project: SaveProjectResource, id: string, version: number): Observable<ProjectResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${id}`)
            .build();
        const body: string = JSON.stringify(project);
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.put<ProjectResource>(url, body, {headers});
    }
}
