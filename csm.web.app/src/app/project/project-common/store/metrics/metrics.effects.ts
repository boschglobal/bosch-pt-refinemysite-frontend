/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    Actions,
    createEffect,
    ofType
} from '@ngrx/effects';
import {
    select,
    Store
} from '@ngrx/store';
import {of} from 'rxjs';
import {
    catchError,
    map,
    mergeMap,
    withLatestFrom
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {
    MetricsService,
    ProjectMetricsTypeFilters
} from '../../api/metrics/metrics.service';
import {MetricsListResource} from '../../api/metrics/resources/metrics-list.resource';
import {ProjectQueries} from '../projects/project.queries';
import {
    MetricsActionEnum,
    MetricsActions
} from './metrics.actions';
import {MetricsQueries} from './metrics.queries';

@Injectable()
export class MetricsEffects {

    private _projectQueries: ProjectQueries = new ProjectQueries();

    private _metricsQueries: MetricsQueries = new MetricsQueries(null);

    constructor(private _actions$: Actions,
                private _store: Store<State>,
                private _metricsService: MetricsService) {
    }

    /**
     * @description Request fulfilled day cards all
     * @type {Observable<Action>}
     */
    public requestFulfilledDayCardsAll$ = createEffect(() => this._actions$
        .pipe(
            ofType(MetricsActionEnum.RequestFulfilledDayCardsAll),
            withLatestFrom(
                this._store.pipe(select(this._projectQueries.getCurrentItemId())),
                this._store.pipe(select(this._metricsQueries.getTimeFilters())),
            ),
            mergeMap(([action, projectId, timeFilters]) => {
                const typeFilters: ProjectMetricsTypeFilters = {type: ['rfv', 'ppc'], grouped: false};

                return this._metricsService
                    .findAll(projectId, timeFilters, typeFilters)
                    .pipe(
                        map((metrics: MetricsListResource) => new MetricsActions.Request.FulfilledDayCardsAllFulfilled(metrics)),
                        catchError(() => of(new MetricsActions.Request.FulfilledDayCardsAllRejected())));
            })));

    /**
     * @description Request fulfilled day cards grouped
     * @type {Observable<Action>}
     */
    public requestFulfilledDayCardsGrouped$ = createEffect(() => this._actions$
        .pipe(
            ofType(MetricsActionEnum.RequestFulfilledDayCardsGrouped),
            withLatestFrom(
                this._store.pipe(select(this._projectQueries.getCurrentItemId())),
                this._store.pipe(select(this._metricsQueries.getTimeFilters())),
            ),
            mergeMap(([action, projectId, timeFilters]) => {
                const typeFilters: ProjectMetricsTypeFilters = {type: ['rfv', 'ppc'], grouped: true};

                return this._metricsService
                    .findAll(projectId, timeFilters, typeFilters)
                    .pipe(
                        map((metrics: MetricsListResource) => new MetricsActions.Request.FulfilledDayCardsGroupedFulfilled(metrics)),
                        catchError(() => of(new MetricsActions.Request.FulfilledDayCardsGroupedRejected())));
            })));

    public requestReasonsForVarianceAll$ = createEffect(() => this._actions$
        .pipe(
            ofType(MetricsActionEnum.RequestReasonsForVarianceAll),
            withLatestFrom(
                this._store.pipe(select(this._projectQueries.getCurrentItemId())),
                this._store.pipe(select(this._metricsQueries.getTimeFilters())),
            ),
            mergeMap(([action, projectId, timeFilters]) => {
                const typeFilters: ProjectMetricsTypeFilters = {type: ['rfv'], grouped: false};

                return this._metricsService
                    .findAll(projectId, timeFilters, typeFilters)
                    .pipe(
                        map((metrics: MetricsListResource) => new MetricsActions.Request.ReasonsForVarianceAllFulfilled(metrics)),
                        catchError(() => of(new MetricsActions.Request.ReasonsForVarianceAllRejected())));
            })));
}
