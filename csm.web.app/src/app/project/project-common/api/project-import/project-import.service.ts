/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
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
import {AbstractResource} from '../../../../shared/misc/api/resources/abstract.resource';
import {ApiUrlHelper} from '../../../../shared/rest/helpers/api-url.helper';
import {ProjectImportAnalyzeResource} from './resources/project-import-analyze.resource';
import {ProjectImportUploadResource} from './resources/project-import-upload.resource';
import {SaveProjectImportAnalyzeResource} from './resources/save-project-import-analyze.resource';

@Injectable({
    providedIn: 'root',
})
export class ProjectImportService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Upload project file
     * @param projectId
     * @param file
     * @returns {Observable<ProjectImportUploadResource>}
     */
    public upload(projectId: string, file: File): Observable<ProjectImportUploadResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/import/upload`)
            .build();
        const data = new FormData();
        data.append('file', file);

        return this._httpClient.post<ProjectImportUploadResource>(url, data);
    }

    /**
     * @description Analyze project file
     * @param projectId
     * @param analyzeParams
     * @param version
     * @returns {Observable<ProjectImportAnalyzeResource>}
     */
    public analyze(projectId: string, analyzeParams: SaveProjectImportAnalyzeResource,
                   version: number): Observable<ProjectImportAnalyzeResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/import/analyze`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.post<ProjectImportAnalyzeResource>(url, analyzeParams, {headers});
    }

    /**
     * @description Import project file
     * @param projectId
     * @param version
     * @returns {Observable<string>}
     */
    public import(projectId: string, version: number): Observable<AbstractResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/import`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.post<AbstractResource>(url, null, {headers});
    }
}
