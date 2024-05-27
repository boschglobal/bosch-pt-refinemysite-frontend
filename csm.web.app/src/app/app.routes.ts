/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Routes} from '@angular/router';

import {MaintenanceComponent} from './shared/misc/error-pages/maintenance/maintenance.component';
import {NotAuthorisedComponent} from './shared/misc/error-pages/not-authorised-component/not-authorised.component';
import {PageNotFoundComponent} from './shared/misc/error-pages/page-not-found-component/page-not-found.component';
import {TheaterComponent} from './shared/theater/containers/theater-component/theater.component';

export const FIRST_ROUTE = 'projects';
export const NOT_AUTHORISED_ROUTE = 'unauthorized';
export const THEATER_ROUTE = 'theater';
export const MAINTENANCE_ROUTE = 'maintenance';

export const APP_ROUTES: Routes = [
    {
        path: '',
        redirectTo: FIRST_ROUTE,
        pathMatch: 'full'
    },
    {
        path: THEATER_ROUTE,
        component: TheaterComponent,
        outlet: 'theater'
    },
    {
        path: NOT_AUTHORISED_ROUTE,
        component: NotAuthorisedComponent
    },
    {
        path: MAINTENANCE_ROUTE,
        component: MaintenanceComponent
    },
    {
        path: '**',
        component: PageNotFoundComponent,
    }
];
