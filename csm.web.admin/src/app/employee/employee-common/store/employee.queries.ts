/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {distinctUntilChanged} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {
    select,
    Store
} from '@ngrx/store';
import {Observable} from 'rxjs';
import {isEqual} from 'lodash';

import {BaseQueries} from '../../../shared/misc/store/base.queries';
import {PaginatorData} from '../../../shared/ui/paginator/paginator-data.datastructure';
import {EmployeeListResourceLinks} from '../api/resources/employee-list.resource';
import {EmployeeResource} from '../api/resources/employee.resource';
import {EmployeeSlice} from './employee.slice';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {State} from '../../../app.reducers';

@Injectable({
    providedIn: 'root',
})
export class EmployeeQueries extends BaseQueries<EmployeeResource, EmployeeSlice, EmployeeListResourceLinks> {

    public sliceName = 'employeeSlice';

    constructor(private _store: Store<State>) {
        super();
    }

    /**
     * @description Retrieves Observable of current employee
     * @returns {Observable<EmployeeResource[]>}
     */
    public observeEmployeesList(): Observable<EmployeeResource[]> {
        return this._store
            .pipe(
                select(this.getCurrentPage()),
                distinctUntilChanged(isEqual));
    }

    /**
     * @description Retrieves Observable of current employee request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeEmployeesListRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getListRequestStatus()),
                distinctUntilChanged());
    }


    /**
     * @description Retrieves Observable of current item current employee request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeCurrentEmployeeRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getCurrentItemRequestStatus()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of Employee of a given id
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeEmployeeById(id: string): Observable<EmployeeResource> {
        return this._store
            .pipe(
                select(this.getItemById(id)),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of current employee
     * @returns {Observable<EmployeeResource>}
     */
    public observeCurrentEmployee(): Observable<EmployeeResource> {
        return this._store
            .pipe(
                select(this.getCurrentItem()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of current pagination information
     * @returns {Observable<boolean>}
     */
    public observeEmployeeListPagination(): Observable<PaginatorData> {
        return this._store
            .pipe(
                select(this.getListPagination()),
                distinctUntilChanged());
    }

}
