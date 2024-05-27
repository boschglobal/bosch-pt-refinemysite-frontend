/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    HttpClient,
    HttpParams
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {ApiUrlHelper} from '../../../../shared/rest/helpers/api-url.helper';
import {ProjectMetricsTimeFilters} from '../../store/metrics/slice/project-metrics-filters';
import {MetricsListResource} from './resources/metrics-list.resource';

@Injectable({
    providedIn: 'root',
})

export class MetricsService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Retrieve all metrics of a specific project
     * @param {string} projectId
     * @param {ProjectMetricsTimeFilters} timeFilters
     * @param {ProjectMetricsTypeFilters} typeFilters
     * @returns {Observable<MetricsListResource>}
     */
    public findAll(projectId: string, timeFilters: ProjectMetricsTimeFilters, typeFilters: ProjectMetricsTypeFilters): Observable<MetricsListResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/metrics`)
            .build();
        const filters = {...timeFilters, ...typeFilters};
        const params = Object.keys(filters)
            .reduce((httpParam, key) => httpParam.append(key, filters[key]), new HttpParams());

        return this._httpClient.get<MetricsListResource>(url, {params});
    }

}

export class ProjectMetricsTypeFilters {
    public type: string[];
    public grouped?: boolean;
}
