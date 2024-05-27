/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Routes
} from '@angular/router';

import {MANAGEMENT_ROUTE_PATHS} from './management/management-routing.routes';
import {NotAuthorisedComponent} from './shared/feedback/not-authorised-component/not-authorised.component';

export const NOT_AUTHORISED_ROUTE = 'unauthorized';

export const APP_ROUTES: Routes = [
    {
        path: '',
        redirectTo: MANAGEMENT_ROUTE_PATHS.management,
        pathMatch: 'full'
    },
    {
        path: NOT_AUTHORISED_ROUTE,
        component: NotAuthorisedComponent
    },
    {
        path: '**',
        redirectTo: MANAGEMENT_ROUTE_PATHS.management,
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: '/',
        pathMatch: 'full'
    }
];
