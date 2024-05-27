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
import {ProjectExportResource} from './resources/project-export.resource';

@Injectable({
    providedIn: 'root',
})
export class ProjectExportService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    public getFile(projectId: string,
                   exportResource: ProjectExportResource): Observable<AbstractResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/export`)
            .build();

        return this._httpClient
            .post<AbstractResource>(url,
                exportResource,
            );
    }
}
