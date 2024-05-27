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
import {ActivityListResource} from './resources/activity-list.resource';

@Injectable({
    providedIn: 'root',
})
export class ActivityService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Retrieve the activity list of a given task.
     * @param {string} taskId
     * @param {string} lastActivityId
     * @param {number} limit
     * @returns {Observable<ActivityListResource>}
     */
    public findAll(taskId: string, lastActivityId?: string, limit = 10): Observable<ActivityListResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/${taskId}/activities`)
            .withCursorPaginationBefore(limit, lastActivityId)
            .build();

        return this._httpClient.get<ActivityListResource>(url);
    }
}
