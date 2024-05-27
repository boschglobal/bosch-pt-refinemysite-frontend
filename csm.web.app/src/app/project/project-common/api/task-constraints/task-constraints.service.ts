/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
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
import {SaveTaskConstraintsResource} from './resources/save-task-constraints.resource';
import {TaskConstraintsResource} from './resources/task-constraints.resource';

@Injectable({
    providedIn: 'root',
})
export class TaskConstraintsService {
    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Get Task Constraints
     * @param projectId<string>
     * @param taskId<string>
     * @returns Observable<TaskConstraintsResource>
     */
    public findOne(projectId: string, taskId: string): Observable<TaskConstraintsResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/tasks/${taskId}/constraints`)
            .build();

        return this._httpClient.get<TaskConstraintsResource>(url);
    }

    /**
     * @description Update Task Constraints
     * @param projectId<string>
     * @param taskId<string>
     * @param body<SaveTaskConstraintsResource>
     * @param version<number>
     * @returns Observable<TaskConstraintsResource>
     */
    public updateOne(projectId: string,
                     taskId: string,
                     body: SaveTaskConstraintsResource,
                     version: number): Observable<TaskConstraintsResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/tasks/${taskId}/constraints`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.put<TaskConstraintsResource>(url, body, {headers});
    }
}
