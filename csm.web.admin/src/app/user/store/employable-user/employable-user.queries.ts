/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Store,
    select
} from '@ngrx/store';
import {
    distinctUntilChanged
} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {isEqual} from 'lodash';

import {BaseQueries} from '../../../shared/misc/store/base.queries';
import {SorterData} from '../../../shared/ui/sorter/sorter-data.datastructure';
import {EmployableUserFilter} from '../../api/resources/employable-user-filter.resource';
import {EmployableUserResourceListLinks} from '../../api/resources/employable-user-list.resource';
import {EmployableUserResource} from '../../api/resources/employable-user.resource';
import {EmployableUserSlice} from './employable-user.slice';
import {PaginatorData} from '../../../shared/ui/paginator/paginator-data.datastructure';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {State} from '../../../app.reducers';

@Injectable({
    providedIn: 'root',
})
export class EmployableUserQueries extends BaseQueries<EmployableUserResource, EmployableUserSlice, EmployableUserResourceListLinks> {

    public sliceName = 'employableUserSlice';

    constructor(private _store: Store<State>) {
        super();
    }

    /**
     * @description Retrieves Observable of current employableUser
     * @returns {Observable<EmployableUserResource[]>}
     */
    public observeEmployableUsersList(): Observable<EmployableUserResource[]> {
        return this._store
            .pipe(
                select(this.getEmployableUsersCurrentPage()),
                distinctUntilChanged(isEqual));
    }

    /**
     * @description Retrieves Observable of current EmployableUsers request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeEmployableUsersListRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getListRequestStatus()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of current pagination information
     * @returns {Observable<PaginatorData>}
     */
    public observeEmployableUsersListPagination(): Observable<PaginatorData> {
        return this._store
            .pipe(
                select(this.getListPagination()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of current employableUser
     * @returns {Observable<EmployableUserResource>}
     */
    public observeCurrentEmployableUser(): Observable<EmployableUserResource> {
        return this._store
            .pipe(
                select(this.getCurrentItem()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of current filtering information
     * @returns {Observable<EmployableUserFilter>}
     */
    public observeEmployableUserListFilter(): Observable<EmployableUserFilter> {
        return this._store
            .pipe(
                select(this.getListFilter()),
                distinctUntilChanged());
    }

    public getListFilter(): (state: State) => EmployableUserFilter {
        return (state: State) => this._getSlice(state).filter;
    }

    /**
     * @description Retrieves Observable of current sort information
     * @returns {Observable<SorterData>}
     */
    public observeEmployableUserListSort(): Observable<SorterData> {
        return this._store
            .pipe(
                select(this.getListSort()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves query function to get current page of given slice
     * @returns {(state: State) => EmployableUserResource[]}
     */
    public getEmployableUsersCurrentPage(): (state: State) => EmployableUserResource[] {
        return (state: State) => {
            const page: number = this._getSlice(state).list.pagination.pageNumber;
            if (this._getSlice(state).list.pages[page]) {
                return this._getSlice(state).list.pages[page]
                    .map((id: string) => this._getSlice(state).items.find((item: any) => item.user.id === id))
                    .filter(item => !!item);
            } else {
                return [];
            }
        };
    }
}
