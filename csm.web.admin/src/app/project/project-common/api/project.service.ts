/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {ApiUrlHelper} from '../../../shared/rest/helper/api-url.helper';
import {ApiVersionsEnum} from '../../../../configurations/api/api-versions.enum';
import {SorterData} from '../../../shared/ui/sorter/sorter-data.datastructure';
import {ProjectDeleteResource} from './resources/project-delete.resource';
import {ProjectFiltersResource} from './resources/project-filters.resource';
import {ProjectListResource} from './resources/project-list.resource';
import {ProjectResource} from './resources/project.resource';

const PROJECT_SORT_FIELDS = {
    title: 'title',
    creator: 'createdBy.firstName,createdBy.lastName',
    createdDate: 'createdDate',
    company: 'company',
};

@Injectable({
    providedIn: 'root',
})
export class ProjectService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Find a single project
     * @param {string} id
     * @returns {Observable<ProjectResource>}
     */
    public findOne(id: string): Observable<ProjectResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${id}`)
            .build();

        return this._httpClient.get<ProjectResource>(url);

    }

    /**
     * @description Find all projects
     * @param {number} pageNumber
     * @param {number} pageSize
     * @param {SorterData} sort
     * @param {ProjectFiltersResource} filters
     * @returns {Observable<ProjectListResource>}
     */
    public findAll(pageNumber: number,
                   pageSize: number,
                   sort?: SorterData,
                   filters?: ProjectFiltersResource): Observable<ProjectListResource> {
        const url = this._apiUrlHelper
            .withPath('projects/search')
            .withPagination(pageSize, pageNumber)
            .withSort(PROJECT_SORT_FIELDS[sort.field], sort.direction)
            .build();

        return this._httpClient.post<ProjectListResource>(url, filters);
    }

    /**
     * @description Delete a project
     * @param {string} projectId
     * @param {ProjectDeleteResource} body
     *
     * @returns {Observable<{}>}
     */
    public delete(projectId: string, body: ProjectDeleteResource): Observable<{}> {
        const requestUrl = this._apiUrlHelper
            .withPath(`projects/${projectId}`)
            .build();

        return this._httpClient.request('delete', requestUrl, {body});
    }
}
