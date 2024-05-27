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
import {NewsListResource} from './resources/news-list.resource';

@Injectable({
    providedIn: 'root',
})
export class NewsService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Retrieves all news that match the identifiers
     * @param itemIds
     * @returns {Observable<Object>}
     */
    public findAll(itemIds: string[]): Observable<NewsListResource> {
        const url = this._apiUrlHelper
            .withPath('projects/tasks/news/search')
            .build();

        return this._httpClient.post<NewsListResource>(url, itemIds);
    }

    /**
     * @description Retrieves all news that match identifier and news that share the same root
     * @param itemIds
     * @returns {Observable<Object>}
     */
    public findAllIncludeNested(itemIds: string[]): Observable<NewsListResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/${itemIds[0]}/news`)
            .build();

        return this._httpClient.get<NewsListResource>(url);
    }

    /**
     * @description Delete all news that match the project identifier and that share the same root
     * @param projectId
     * @returns {Observable<Object>}
     */
    public deleteAll(projectId: string): Observable<void> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/news`)
            .build();

        return this._httpClient.delete<void>(url);
    }

    /**
     * @description Delete all news that match identifier and that share the same root
     * @param itemId
     * @returns {Observable<Object>}
     */
    public deleteById(itemId: string): Observable<void> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/${itemId}/news`)
            .build();

        return this._httpClient.delete<void>(url);
    }
}
