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

import {ApiVersionsEnum} from '../../../../configurations/api/api-versions.enum';
import {CompanyFilterData} from './resources/company-filter.resource';
import {CompanyListResource} from './resources/company-list.resource';
import {CompanyResource} from './resources/company.resource';
import {CompanySaveResource} from './resources/company-save.resource';
import {CompanySuggestionsResource} from './resources/company-suggestions.resource';
import {ApiUrlHelper} from '../../../shared/rest/helper/api-url.helper';
import {SorterData} from '../../../shared/ui/sorter/sorter-data.datastructure';

@Injectable({
    providedIn: 'root'
})
export class CompanyService {
    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Company);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * Create a new company
     *
     * @return An observable of the created company
     */
    public create(company: CompanySaveResource): Observable<CompanyResource> {
        const requestUrl = this._apiUrlHelper
            .withPath('companies')
            .build();
        return this._httpClient.post<CompanyResource>(requestUrl, company);
    }

    /**
     * Find a company by companyId
     *
     * @param companyId
     * @returns {Observable<CompanyResource>}
     */
    public findOne(companyId: string): Observable<CompanyResource> {
        const requestUrl = this._apiUrlHelper
            .withPath(`companies/${companyId}`)
            .build();
        return this._httpClient.get<CompanyResource>(requestUrl);
    }

    /**
     * Finds all companySelectItems.
     *
     * @return An observable array of companySelectItems
     */
    public findCompanies(pageIndex?: number,
                         pageSize?: number,
                         sort?: SorterData,
                         filter?: CompanyFilterData): Observable<CompanyListResource> {
        const requestUrl = this._apiUrlHelper
            .withPath(`companies/search`)
            .withPagination(pageSize, pageIndex)
            .withSort(sort.field, sort.direction)
            .build();
        return this._httpClient.post<CompanyListResource>(requestUrl, JSON.stringify(filter));
    }

    /**
     * Deletes a company
     *
     * @return An observable without payload since it just returns a status code
     */
    public delete(companyId: string, version: number): Observable<{}> {
        const requestUrl = this._apiUrlHelper
            .withPath(`companies/${companyId}`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());
        return this._httpClient.delete(requestUrl, {headers});
    }

    /**
     * Updates a company {companyId}
     *
     * @return An observable of the updated employee
     */
    public update(companyId: string, payload: CompanySaveResource, version: number): Observable<CompanyResource> {
        const requestUrl = this._apiUrlHelper
            .withPath(`companies/${companyId}`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());
        return this._httpClient.put<CompanyResource>(requestUrl, payload, {headers});
    }

    /**
     * Finds suggested companies for a user
     *
     * @return {Observable<UserResource>}
     */
    public findSuggestions(searchQuery: string, size = 15, pageIndex = 0): Observable<CompanySuggestionsResource> {
        const requestUrl = this._apiUrlHelper
            .withPath('companies/suggestions')
            .withPagination(size, pageIndex)
            .build();

        const body = {term: searchQuery};

        return this._httpClient.post<CompanySuggestionsResource>(requestUrl, body);
    }

}
