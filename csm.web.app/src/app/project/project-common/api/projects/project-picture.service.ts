/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {ApiUrlHelper} from '../../../../shared/rest/helpers/api-url.helper';
import {ProjectPictureResource} from './resources/project-picture.resource';

@Injectable({
    providedIn: 'root',
})
export class ProjectPictureService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Upload a picture to the project
     * @param {string} projectId
     * @param {File} picture
     * @returns {Observable<ProjectPictureResource>}
     */
    public upload(projectId: string, picture: File): Observable<ProjectPictureResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/picture`)
            .build();
        const data = new FormData();
        data.append('file', picture);

        return this._httpClient.post<ProjectPictureResource>(url, data);
    }

    /**
     * @description Find a project by id
     * @param {string} projectId
     * @returns {Observable<ProjectPictureResource>}
     */
    public findByProjectId(projectId: string): Observable<ProjectPictureResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/picture`)
            .build();

        return this._httpClient.get<ProjectPictureResource>(url);
    }

    /**
     * @description Remove a picture from a project by project id
     * @param {string} projectId
     * @returns {Observable<ProjectPictureResource>}
     */
    public remove(projectId: string): Observable<ProjectPictureResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/picture`)
            .build();

        return this._httpClient.delete<ProjectPictureResource>(url);
    }
}
