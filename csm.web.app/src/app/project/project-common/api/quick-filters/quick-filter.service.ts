/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    HttpClient,
    HttpHeaders,
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {ApiUrlHelper} from '../../../../shared/rest/helpers/api-url.helper';
import {QuickFilterResource} from './resources/quick-filter.resource';
import {QuickFilterListResource} from './resources/quick-filter-list.resource';
import {SaveQuickFilterResource} from './resources/save-quick-filter.resource';

@Injectable({
    providedIn: 'root',
})
export class QuickFilterService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Retrieves all quick filters
     * @description No pagination needed because the quick filters are limited to 100
     * @param projectId
     */
    public findAll(projectId: string): Observable<QuickFilterListResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/quickfilters`)
            .build();

        return this._httpClient.get<QuickFilterListResource>(url);
    }

    /**
     * @description Create quick filter
     * @param projectId
     * @param body
     */
    public create(projectId: string, body: SaveQuickFilterResource): Observable<QuickFilterResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/quickfilters`)
            .build();

        return this._httpClient.post<QuickFilterResource>(url, body);
    }

    /**
     * @description Delete quick filter with given filterId
     * @param projectId
     * @param filterId
     * @param version
     */
    public delete(projectId: string, filterId: string, version: number): Observable<void> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/quickfilters/${filterId}`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.delete<void>(url, {headers});
    }

    /**
     * @description Update quick filter with given filterId
     * @param projectId
     * @param filterId
     * @param body
     * @param version
     */
    public update(projectId: string, filterId: string,
                  body: SaveQuickFilterResource, version: number): Observable<QuickFilterResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/quickfilters/${filterId}`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.put<QuickFilterResource>(url, body, {headers});
    }
}
