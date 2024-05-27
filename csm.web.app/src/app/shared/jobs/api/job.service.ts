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

import {ApiVersionsEnum} from '../../../../configurations/api/api-versions.enum';
import {ApiUrlHelper} from '../../rest/helpers/api-url.helper';
import {JobListResource} from './resources/job-list.resource';

@Injectable({
    providedIn: 'root',
})
export class JobService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Job);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Retrieve all jobs
     * @param {number} pageNumber
     * @param {number} size
     * @returns {Observable<JobListResource>}
     */
    public findAll(pageNumber: number, size: number): Observable<JobListResource> {
        const url = this._apiUrlHelper
            .withPath('jobs')
            .withPagination(size, pageNumber)
            .build();

        return this._httpClient.get<JobListResource>(url);
    }

    /**
     * @description Mark job list as seen
     * @returns {Observable<{}>}
     */
    public markJobListAsSeen(lastSeen: string): Observable<{}> {
        const url = this._apiUrlHelper
            .withPath('jobs/seen')
            .build();

        return this._httpClient.post<{}>(url, {lastSeen});
    }

    /**
     * @description Mark job as read
     * @param {string} id
     * @returns {Observable<{}>}
     */
    public markJobAsRead(id: string): Observable<{}> {
        const url = this._apiUrlHelper
            .withPath(`jobs/${id}/read`)
            .build();

        return this._httpClient.post<{}>(url, null);
    }
}
