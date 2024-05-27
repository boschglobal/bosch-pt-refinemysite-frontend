/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    select,
    Store,
} from '@ngrx/store';
import {
    isEqual,
    orderBy,
} from 'lodash';
import {Observable} from 'rxjs';
import {
    distinctUntilChanged,
    map,
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {BaseQueries} from '../../../../shared/misc/store/base.queries';
import {QuickFilterResource} from '../../api/quick-filters/resources/quick-filter.resource';
import {QuickFilterListLinks} from '../../api/quick-filters/resources/quick-filter-list.resource';
import {
    QuickFilter,
    QuickFilterId,
} from '../../models/quick-filters/quick-filter';
import {
    QuickFilterAppliedFilters,
    QuickFilterContext,
    QuickFilterSlice,
} from './quick-filter.slice';

@Injectable({
    providedIn: 'root',
})
export class QuickFilterQueries extends BaseQueries<QuickFilterResource, QuickFilterSlice, QuickFilterListLinks> {

    public moduleName = 'projectModule';

    public sliceName = 'quickFilterSlice';

    constructor(private _store: Store<State>) {
        super();
    }

    public observeQuickFilterById(itemId: string): Observable<QuickFilter> {
        return this._store
            .pipe(
                select(this.getItemById(itemId)),
                distinctUntilChanged(isEqual),
                map(quickFilterResource => QuickFilter.fromQuickFilterResource(quickFilterResource)),
            );
    }

    public observeQuickFilterList(): Observable<QuickFilter[]> {
        return this._store
            .pipe(
                select(this.getList()),
                distinctUntilChanged(isEqual),
                map(quickFilterResources =>
                    quickFilterResources.map(quickFilterResource => QuickFilter.fromQuickFilterResource(quickFilterResource))
                ),
                map(quickFilters => orderBy(quickFilters, quickFilter => quickFilter.name.toLowerCase(), 'asc')),
            );
    }

    public observeQuickFilterListRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getListRequestStatus()),
                distinctUntilChanged(),
            );
    }

    public observeCurrentQuickFilterRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getCurrentItemRequestStatus()),
                distinctUntilChanged(),
            );
    }

    public observeQuickFilterListCreatePermission(): Observable<boolean> {
        return this._store
            .pipe(
                select(this.getListLinks()),
                map(links => 'create' in links),
                distinctUntilChanged(),
            );
    }

    public observeAppliedFilters(): Observable<QuickFilterAppliedFilters> {
        return this._store
            .pipe(
                select(this._getAppliedFilters()),
                distinctUntilChanged());
    }

    public observeAppliedFilterByContext(context: QuickFilterContext): Observable<QuickFilterId> {
        return this._store
            .pipe(
                select(this._getAppliedFilters()),
                map(appliedFilters => appliedFilters[context]),
                distinctUntilChanged());
    }

    private _getAppliedFilters(): (state: State) => QuickFilterAppliedFilters {
        return (state: State) => this._getSlice(state).appliedFilterId;
    }
}
