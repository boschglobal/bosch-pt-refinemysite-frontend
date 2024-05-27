/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    distinctUntilChanged,
    map,
    take
} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {
    select,
    Store
} from '@ngrx/store';
import {Observable} from 'rxjs';
import {isEqual} from 'lodash';

import {BaseQueries} from '../../../shared/misc/store/base.queries';
import {SorterData} from '../../../shared/ui/sorter/sorter-data.datastructure';
import {CompanyFilterData} from '../api/resources/company-filter.resource';
import {CompanyListResourceLinks} from '../api/resources/company-list.resource';
import {CompanyResource} from '../api/resources/company.resource';
import {CompanySlice} from './company.slice';
import {PaginatorData} from '../../../shared/ui/paginator/paginator-data.datastructure';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {ResourceReference} from '../../../shared/misc/api/datatypes/resource-reference.datatype';
import {State} from '../../../app.reducers';

@Injectable({
    providedIn: 'root',
})
export class CompanyQueries extends BaseQueries<CompanyResource, CompanySlice, CompanyListResourceLinks> {

    public sliceName = 'companySlice';

    constructor(private _store: Store<State>) {
        super();
    }

    /**
     * @description Retrieves Observable of current company list
     * @returns {Observable<CompanyResource[]>}
     */
    public observeCompanyList(): Observable<CompanyResource[]> {
        return this._store
            .pipe(
                select(this.getCurrentPage()),
                distinctUntilChanged(isEqual));
    }

    /**
     * @description Retrieves Observable of current company request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeCompanyListRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getListRequestStatus()),
                distinctUntilChanged());
    }


    /**
     * @description Retrieves Observable of current company request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeCurrentCompanyRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getCurrentItemRequestStatus()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of Company of a given id
     * @returns {Observable<CompanyResource>}
     */
    public observeCompanyById(id: string): Observable<CompanyResource> {
        return this._store
            .pipe(
                select(this.getItemById(id)),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves whether the company for given id if exists
     * @param {string} id
     * @returns {boolean}
     */
    public hasCompanyById(id: string): boolean {
        let result = false;

        this.observeCompanyById(id)
            .pipe(
                map((company: CompanyResource) => !!company),
                take(1))
            .subscribe(hasParticipantById => result = hasParticipantById)
            .unsubscribe();
        return result;
    }

    /**
     * @description Retrieves Observable of current pagination information
     * @returns {Observable<PaginatorData>}
     */
    public observeCompanyListPagination(): Observable<PaginatorData> {
        return this._store
            .pipe(
                select(this.getListPagination()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of current filtering information
     * @returns {Observable<CompanyFilterData>}
     */
    public observeCompanyListFilter(): Observable<CompanyFilterData> {
        return this._store
            .pipe(
                select(this.getListFilter()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of current sorting information
     * @returns {Observable<SorterData>}
     */
    public observeCompanyListSort(): Observable<SorterData> {
        return this._store
            .pipe(
                select(this.getListSort()),
                distinctUntilChanged());
    }

    public getListFilter(): (state: State) => CompanyFilterData {
        return (state: State) =>
            this._getSlice(state).list.filter;
    }

    /**
     * @description Retrieves Observable of current company
     * @returns {Observable<CompanyResource>}
     */
    public observeCurrentCompany(): Observable<CompanyResource> {
        return this._store
            .pipe(
                select(this.getCurrentItem()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of company suggestions
     * @returns {Observable<ResourceReference[]>}
     */
    public observeCompanySuggestions(): Observable<ResourceReference[]> {
        return this._store
            .pipe(
                select(this._getCurrentSuggestions()),
                distinctUntilChanged(isEqual));
    }

    /**
     * @description Retrieves query function to get the suggestions from the store
     * @returns {(state: State) => ResourceReference[]}
     */
    private _getCurrentSuggestions(): (state: State) => ResourceReference[] {
        return (state: State) =>
            this._getSlice(state).suggestions
        ;
    }
}
