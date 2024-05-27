/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Routes} from '@angular/router';

import {AuthComponent} from '../auth.component';
import {LoginComponent} from '../auth-login/presentationals/login-component/login.component';
import {RegisterComponent} from '../auth-register/containers/register/register.component';
import {SignupComponent} from '../auth-signup/containers/signup-component/signup.component';
import {AUTH_ROUTE_PATHS} from './auth-routes.paths';
import {UnauthenticatedGuard} from './guards/unauthenticated.guard';
import {SignupResolverGuard} from './resolvers/signup-resolver.guard';

export const AUTH_ROUTES: Routes = [
    {
        path: AUTH_ROUTE_PATHS.authentication,
        component: AuthComponent,
        children: [
            {
                path: '',
                redirectTo: AUTH_ROUTE_PATHS.login,
                pathMatch: 'prefix',
            },
            {
                path: AUTH_ROUTE_PATHS.login,
                component: LoginComponent,
                canActivate: [UnauthenticatedGuard],
            },
            {
                path: AUTH_ROUTE_PATHS.signup,
                component: SignupComponent,
                canActivate: [SignupResolverGuard],
            },
        ],
    },
    {
        path: AUTH_ROUTE_PATHS.register,
        component: RegisterComponent,
        canActivate: [UnauthenticatedGuard],
    },
];
