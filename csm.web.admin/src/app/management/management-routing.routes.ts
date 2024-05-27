/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Routes} from '@angular/router';

import {AuthenticatedAndAuthorizedGuard} from '../auth/auth-routing/guards/authenticated-and-authorized.guard';
import {
    COMPANY_ROUTE_PATHS,
    COMPANY_ROUTES
} from '../company/company-routing/company-routing.routes';
import {FEATURE_ROUTES} from '../feature/feature-routing/feature-routing.routes';
import {ManagementComponent} from './presentational/management.component';
import {PROJECT_ROUTES} from '../project/project-routing/project-routing.routes';
import {USER_ROUTES} from '../user/user-routing/user-routing.routes';

export const MANAGEMENT_ROUTE_PATHS: any = {
    management: 'management',
};

export const MANAGEMENT_ROUTES: Routes = [
    {
        path: `${MANAGEMENT_ROUTE_PATHS.management}`,
        component: ManagementComponent,
        canActivate: [AuthenticatedAndAuthorizedGuard],
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: `${COMPANY_ROUTE_PATHS.companies}`
            },
            ...COMPANY_ROUTES,
            ...USER_ROUTES,
            ...PROJECT_ROUTES,
            ...FEATURE_ROUTES,
        ]
    }
];
