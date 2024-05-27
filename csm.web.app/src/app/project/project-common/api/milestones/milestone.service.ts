/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    HttpClient,
    HttpHeaders
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {AbstractItemsResource} from '../../../../shared/misc/api/resources/abstract-items.resource';
import {ApiUrlHelper} from '../../../../shared/rest/helpers/api-url.helper';
import {MilestoneResource} from './resources/milestone.resource';
import {MilestoneListResource} from './resources/milestone-list.resource';
import {SaveMilestoneResource} from './resources/save-milestone.resource';
import {SaveMilestoneFilters} from './resources/save-milestone-filters';

@Injectable({
    providedIn: 'root',
})
export class MilestoneService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Retrieves milestone with given milestoneId
     * @param milestoneId
     * @returns {Observable<MilestoneResource>}
     */
    public findOne(milestoneId: string): Observable<MilestoneResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/milestones/${milestoneId}`)
            .build();

        return this._httpClient.get<MilestoneResource>(url);
    }

    /**
     * @description Retrieves all milestones with
     * @param {string} projectId
     * @param {number} pageNumber
     * @param {number} size
     * @param {SaveMilestoneFilters} filters
     * @returns {Observable<MilestoneListResource>}
     */
    public findAll(projectId: string, pageNumber: number, size: number, filters: SaveMilestoneFilters): Observable<MilestoneListResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/milestones/search`)
            .withPagination(size, pageNumber)
            .build();

        return this._httpClient.post<MilestoneListResource>(url, filters);
    }

    /**
     * @description Retrieves all milestones by ids
     * @param {string} projectId
     * @param {string[]} ids
     * @returns {Observable<MilestoneResource[]>}
     */
    public findAllByIds(projectId: string, ids: string[]): Observable<MilestoneResource[]> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/milestones/batch/find`)
            .build();

        return this._httpClient
            .post<AbstractItemsResource<MilestoneResource>>(url, {ids})
            .pipe(map(response => response.items));
    }

    /**
     * @description Create milestone
     * @param {SaveMilestoneResource} milestone
     * @returns {Observable<MilestoneResource>}
     */
    public create(milestone: SaveMilestoneResource): Observable<MilestoneResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/milestones`)
            .build();

        return this._httpClient.post<MilestoneResource>(url, milestone);
    }

    /**
     * @description Updates milestone with given milestoneId
     * @param milestoneId
     * @param body
     * @param version of the milestone
     * @returns {Observable<MilestoneResource>}
     */
    public update(milestoneId: string, body: SaveMilestoneResource, version: number): Observable<MilestoneResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/milestones/${milestoneId}`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.put<MilestoneResource>(url, body, {headers});
    }

    /**
     * @description Delete milestone with given milestoneId
     * @param milestoneId
     * @param version of the milestone
     * @returns {Observable<void>}
     */
    public delete(milestoneId: string, version: number): Observable<void> {
        const url = this._apiUrlHelper
            .withPath(`projects/milestones/${milestoneId}`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.delete<void>(url, {headers});
    }
}
