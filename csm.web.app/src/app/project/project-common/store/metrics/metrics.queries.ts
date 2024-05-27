/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    select,
    Store
} from '@ngrx/store';
import {isEqual} from 'lodash';
import {Observable} from 'rxjs';
import {
    distinctUntilChanged,
    filter,
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {MetricsResource} from '../../api/metrics/resources/metrics.resource';
import {ProjectMetricsTimeFilters} from './slice/project-metrics-filters';

@Injectable({
    providedIn: 'root',
})
export class MetricsQueries {
    public moduleName = 'projectModule';
    public sliceName = 'metricsSlice';

    constructor(private _store: Store<State>) {
    }

    /**
     * @description Retrieves Observable of fulfilled day cards all
     * @returns {Observable<MetricsResource[]>}
     */
    public observeFulfilledDayCardsAll(): Observable<MetricsResource[]> {
        return this._store
            .pipe(
                select(this.getFulFilledDayCardsAll()),
                distinctUntilChanged(isEqual)
            );
    }

    /**
     * @description Retrieves Observable of fulfilled day cards all request status
     * @returns {Observable<RequestStatusEnum[]>}
     */
    public observeFulfilledDayCardsAllRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getFulfilledDayCardsAllRequestStatus()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves fulfilled day cards all resources
     * @returns {Function}
     */
    public getFulFilledDayCardsAll(): (state: State) => MetricsResource[] {
        return (state: State) => {
            return state[this.moduleName][this.sliceName].fulfilledDayCardsAll.items;
        };
    }

    /**
     * @description Retrieves fulfilled day cards all request status
     * @returns {Function}
     */
    public getFulfilledDayCardsAllRequestStatus(): (state: State) => RequestStatusEnum {
        return (state: State) => {
            return state[this.moduleName][this.sliceName].fulfilledDayCardsAll.requestStatus;
        };
    }

    /**
     * @description Retrieves Observable of fulfilled day cards grouped
     * @returns {Observable<MetricsResource[]>}
     */
    public observeFulfilledDayCardsGrouped(): Observable<MetricsResource[]> {
        return this._store
            .pipe(
                select(this.getFulFilledDayCardsGrouped()),
                distinctUntilChanged(isEqual)
            );
    }

    /**
     * @description Retrieves Observable of fulfilled day cards grouped request status
     * @returns {Observable<RequestStatusEnum[]>}
     */
    public observeFulfilledDayCardsGroupedRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getFulfilledDayCardsGroupedRequestStatus()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves fulfilled day cards grouped resources
     * @returns {Function}
     */
    public getFulFilledDayCardsGrouped(): (state: State) => MetricsResource[] {
        return (state: State) => {
            return state[this.moduleName][this.sliceName].fulfilledDayCardsGrouped.items;
        };
    }

    /**
     * @description Retrieves fulfilled day cards grouped request status
     * @returns {Function}
     */
    public getFulfilledDayCardsGroupedRequestStatus(): (state: State) => RequestStatusEnum {
        return (state: State) => {
            return state[this.moduleName][this.sliceName].fulfilledDayCardsGrouped.requestStatus;
        };
    }

    /**
     * @description Retrieves Observable of Reasons For Variance All
     * @returns {Observable<MetricsResource[]>}
     */
    public observeReasonsForVarianceAll(): Observable<MetricsResource> {
        return this._store
            .pipe(
                select(this.getReasonsForVarianceAll()),
                filter(item => !!item),
                distinctUntilChanged(isEqual),
            );
    }

    /**
     * @description Retrieves Reasons For Variance resources
     * @returns {Function}
     */
    public getReasonsForVarianceAll(): (state: State) => MetricsResource {
        return (state: State) => {
            return state[this.moduleName][this.sliceName].reasonsForVarianceAll.items[0];
        };
    }

    /**
     * @description Retrieves Observable of Reasons For Variance request status
     * @returns {Observable<RequestStatusEnum[]>}
     */
    public observeReasonsForVarianceAllRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getReasonsForVarianceAllRequestStatus()),
                distinctUntilChanged());

    }

    /**
     * @description Retrieves Reasons For Variance request status
     * @returns {Function}
     */
    public getReasonsForVarianceAllRequestStatus(): (state: State) => RequestStatusEnum {
        return (state: State) => {
            return state[this.moduleName][this.sliceName].reasonsForVarianceAll.requestStatus;
        };
    }

    /**
     * @description Retrieves Observable of metrics time filters
     * @returns {Observable<RequestStatusEnum[]>}
     */
    public observeTimeFilters(): Observable<ProjectMetricsTimeFilters> {
        return this._store
            .pipe(
                select(this.getTimeFilters()),
                filter(timeFilters => this._areTimeFiltersValid(timeFilters)),
                distinctUntilChanged(isEqual));
    }

    /**
     * @description Retrieves metrics time filters
     * @returns {Function}
     */
    public getTimeFilters(): (state: State) => ProjectMetricsTimeFilters {
        return (state: State) => {
            return state[this.moduleName][this.sliceName].timeFilters;
        };
    }

    /**
     * @description Verifies if time filters are valid
     * @param timeFilters<ProjectMetricsTimeFilters>
     * @private
     * @returns boolean
     */
    private _areTimeFiltersValid(timeFilters: ProjectMetricsTimeFilters): boolean {
        return !!(timeFilters && timeFilters.duration && timeFilters.startDate);
    }
}
