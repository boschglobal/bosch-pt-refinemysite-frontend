/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {AbstractResource} from '../../../../shared/misc/api/resources/abstract.resource';
import {ApiUrlHelper} from '../../../../shared/rest/helpers/api-url.helper';
import {CreateProjectCopyResource} from './resources/create-project-copy.resource';

@Injectable({
    providedIn: 'root',
})
export class ProjectCopyService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Copy project
     * @param projectId
     * @param projectCopy
     * @returns {Observable<ProjectImportUploadResource>}
     */
    public copyOne(projectId: string, projectCopy: CreateProjectCopyResource): Observable<AbstractResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/copy`)
            .build();

        return this._httpClient.post<AbstractResource>(url, projectCopy);
    }
}
