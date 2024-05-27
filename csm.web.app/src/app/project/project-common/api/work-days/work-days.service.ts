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
import {ApiUrlHelper} from '../../../../shared/rest/helpers/api-url.helper';
import {UpdateWorkDaysPayload} from '../../store/work-days/work-days.actions';
import {WorkDaysResource} from './resources/work-days.resource';

@Injectable({
    providedIn: 'root',
})
export class WorkDaysService {
    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    public findAll(projectId: string): Observable<WorkDaysResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/workdays`)
            .build();

        return this._httpClient.get<WorkDaysResource>(url);
    }

    public update(projectId: string, body: UpdateWorkDaysPayload, version: number): Observable<WorkDaysResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/workdays`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.put<WorkDaysResource>(url, body, {headers});
    }
}
