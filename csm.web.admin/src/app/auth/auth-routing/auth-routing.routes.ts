/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Routes} from '@angular/router';

import {AUTH_ROUTE_PATHS} from './auth-routes.paths';
import {AuthComponent} from '../auth.component';
import {LoginComponent} from '../auth-login/presentationals/login-component/login.component';
import {UnauthenticatedGuard} from './guards/unauthenticated.guard';
import {UnauthorizedComponent} from '../auth-unauthorized/unauthorized.component';

export const AUTH_ROUTES: Routes = [
    {
        path: AUTH_ROUTE_PATHS.authentication,
        component: AuthComponent,
        children: [
            {
                path: '',
                redirectTo: AUTH_ROUTE_PATHS.login,
                pathMatch: 'prefix'
            },
            {
                path: AUTH_ROUTE_PATHS.login,
                component: LoginComponent,
                canActivate: [UnauthenticatedGuard]
            },
            {
                path: AUTH_ROUTE_PATHS.unauthorized,
                component: UnauthorizedComponent,
            }
        ]
    }
];
