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
import {SaveWorkareaResource} from './resources/save-workarea.resource';
import {SaveWorkareaListResource} from './resources/save-workarea-list.resource';
import {WorkareaResource} from './resources/workarea.resource';
import {WorkareaListResource} from './resources/workarea-list.resource';

@Injectable({
    providedIn: 'root',
})
export class WorkareaService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Retrieve all the workareas of a given project
     * @param {string} projectId
     * @returns {Observable<WorkareaListResource>}
     */
    public findAll(projectId: string): Observable<WorkareaListResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/workareas`)
            .build();

        return this._httpClient.get<WorkareaListResource>(url);
    }

    /**
     * @description Create workarea
     * @param {SaveWorkareaResource} workarea
     * @param {string} version
     * @returns {Observable<WorkareaResource>}
     */
    public create(workarea: SaveWorkareaResource, version: number): Observable<WorkareaListResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/workareas`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.post<WorkareaListResource>(url, workarea, {headers});
    }

    /**
     * @description Deletes workarea with given id
     * @param {string} id
     * @param {number} version
     * @returns {Observable<WorkareaListResource>}
     */
    public delete(id: string, version: number): Observable<WorkareaListResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/workareas/${id}`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.delete<WorkareaListResource>(url, {headers});
    }

    /**
     * @description Update workarea with given id
     * @param {SaveWorkareaResource} workarea
     * @param {string} id
     * @returns {Observable<WorkareaResource>}
     */
    public update(id: string, workarea: SaveWorkareaResource): Observable<WorkareaResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/workareas/${id}`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', workarea.version.toString());

        return this._httpClient.put<WorkareaResource>(url, workarea, {headers});
    }

    /**
     * @description Update workarea list reordering work area with given id to new position
     * @param {SaveWorkareaListResource} workarea
     * @param {string} version
     * @returns {Observable<WorkareaListResource>}
     */
    public updateList(workarea: SaveWorkareaListResource, version: number): Observable<WorkareaListResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/workareas`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.put<WorkareaListResource>(url, workarea, {headers});
    }
}
