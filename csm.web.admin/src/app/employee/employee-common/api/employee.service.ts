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
import {EmployeeListResource} from './resources/employee-list.resource';
import {EmployeeResource} from './resources/employee.resource';
import {EmployeeSaveResource} from './resources/employee-save.resource';
import {ApiUrlHelper} from '../../../shared/rest/helper/api-url.helper';
import {SorterData} from '../../../shared/ui/sorter/sorter-data.datastructure';

const EMPLOYEE_SORT_FIELDS: Object = {
    name: 'user.firstName,user.lastName',
    email: 'user.email'
};

@Injectable({
    providedIn: 'root',
})
export class EmployeeService {
    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Company);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * Retrieves page of employees {pageNumber} with size {size] of a given company {companyId}
     *
     * @param companyId
     * @param pageNumber
     * @param size
     * @param sort
     * @returns An observable of the page of employees
     */
    public findAll(companyId: string, pageNumber: number = 0, size: number = 5, sort?: SorterData): Observable<EmployeeListResource> {
        const requestUrl = this._apiUrlHelper
            .withPath(`companies/${companyId}/employees`)
            .withPagination(size, pageNumber)
            .withSort(EMPLOYEE_SORT_FIELDS[sort.field], sort.direction)
            .build();
        return this._httpClient.get<EmployeeListResource>(requestUrl);
    }

    /**
     * Retrieves employee of given employeeId
     *
     * @param employeeId
     * @returns {Observable<{EmployeeResource}>}
     */
    public findOne(employeeId: string): Observable<EmployeeResource> {
        const requestUrl = this._apiUrlHelper
            .withPath(`companies/employees/${employeeId}`)
            .build();

        return this._httpClient.get<EmployeeResource>(requestUrl);
    }

    /**
     * Create a new company for company {companyId}
     *
     * @return An observable of the created employee
     */
    public create(companyId: string, payload: EmployeeSaveResource): Observable<EmployeeResource> {
        const requestUrl = this._apiUrlHelper
            .withPath(`companies/${companyId}/employees`)
            .build();
        return this._httpClient.post<EmployeeResource>(requestUrl, payload);
    }

    /**
     * Updates an employee {employeeId}
     *
     * @return An observable of the updated employee
     */
    public update(employeeId: string, payload: EmployeeSaveResource, version: number): Observable<EmployeeResource> {
        const requestUrl = this._apiUrlHelper
            .withPath(`companies/employees/${employeeId}`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());
        return this._httpClient.put<EmployeeResource>(requestUrl, payload, {headers});
    }

    /**
     * @description Deletes an employee
     * @param {string} employeeId
     * @param {number} version
     * @returns {Observable<{}>}
     */
    public delete(employeeId: string, version: number): Observable<{}> {
        const requestUrl = this._apiUrlHelper
            .withPath(`companies/employees/${employeeId}`)
            .build();
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());
        return this._httpClient.delete(requestUrl, {headers});
    }

}
