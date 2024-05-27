/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    OnDestroy,
    OnInit
} from '@angular/core';
import {Subscription} from 'rxjs';

import {NavigationTabsRoutes} from '../../../../../shared/misc/presentationals/navigation-tabs/navigation-tabs.component';
import {MetricsQueries} from '../../../../project-common/store/metrics/metrics.queries';
import {PROJECT_ROUTE_PATHS} from '../../../../project-routing/project-route.paths';

@Component({
    selector: 'ss-project-kpis-tab-navigation',
    templateUrl: './project-kpis-tab-navigation.component.html',
    styleUrls: ['./project-kpis-tab-navigation.component.scss']
})
export class ProjectKpisTabNavigationComponent implements OnInit, OnDestroy {

    /**
     * @description Tab routes for navigation tabs
     * @type {NavigationTabsRoutes[]}
     */
    public routes: NavigationTabsRoutes[] = [
        {
            label: 'Project_Kpis_FulfilledDayCards',
            link: PROJECT_ROUTE_PATHS.ppc,
            queryParams: {}
        },
        {
            label: 'Generic_Variance',
            link: PROJECT_ROUTE_PATHS.rfv,
            queryParams: {}
        }
    ];

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _metricsQueries: MetricsQueries) {
    }

    ngOnInit(): void {
        this._setSubscriptions();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    private _setRoutesQueryParams(params): void {
        this.routes.forEach(route => Object.assign(route.queryParams, params));
    }

    /**
     * @description Set component subscriptions
     * @private
     */
    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._metricsQueries.observeTimeFilters()
                .subscribe(timeFilters => this._setRoutesQueryParams({duration: timeFilters.duration}))
        );
    }

    /**
     * @description Unsets component subscriptions
     * @private
     */
    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
