/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {ApiUrlHelper} from '../../../../shared/rest/helpers/api-url.helper';
import {CompanyReferenceListResource} from './resources/company-reference-list.resource';

@Injectable({
    providedIn: 'root',
})
export class ProjectCompanyService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Retrieve all companies of a specific project
     * @param {string} projectId
     * @param {boolean} includeInactive flag indicating if companies of inactive participant should be retrieved as well
     * @param {number} pageNumber
     * @param {number} size
     * @returns {Observable<CompanyReferenceListResource>}
     */
    public findAll(projectId: string, includeInactive = false, pageNumber = 0, size = 500): Observable<CompanyReferenceListResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/companies`)
            .withPagination(size, pageNumber)
            .withQueryParam('includeInactive', includeInactive)
            .build();

        return this._httpClient.get<CompanyReferenceListResource>(url);
    }
}
