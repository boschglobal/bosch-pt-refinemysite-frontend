/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {ApiVersionsEnum} from '../../../configurations/api/api-versions.enum';
import {EmployableUserListResource} from './resources/employable-user-list.resource';
import {EmployableUserFilter} from './resources/employable-user-filter.resource';
import {ApiUrlHelper} from '../../shared/rest/helper/api-url.helper';
import {SorterData} from '../../shared/ui/sorter/sorter-data.datastructure';

@Injectable({
    providedIn: 'root',
})
export class EmployableUserService {
    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Company);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * Finds all employableUserSelectItems.
     *
     * @return An observable array of companySelectItems
     */
    public findAll(pageIndex?: number,
                   pageSize?: number,
                   sort?: SorterData,
                   filter?: EmployableUserFilter): Observable<EmployableUserListResource> {
        const requestUrl = this._apiUrlHelper
            .withPath(`companies/employees/search`)
            .withPagination(pageSize, pageIndex)
            .withSort(EMPLOYABLE_USER_SORT_FIELDS[sort.field], sort.direction)
            .build();
        return this._httpClient.post<EmployableUserListResource>(requestUrl, filter);
    }

}

const EMPLOYABLE_USER_SORT_FIELDS = {
    name: 'user.firstName,user.lastName',
    email: 'user.email',
    company: 'company.displayName,user.firstName,user.lastName',
    createdAt: 'user.createdAt'
};
