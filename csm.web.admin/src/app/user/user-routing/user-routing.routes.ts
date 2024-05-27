/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Routes} from '@angular/router';

import {AuthenticatedAndAuthorizedGuard} from '../../auth/auth-routing/guards/authenticated-and-authorized.guard';
import {UserDetailsGuard} from './guards/user-details.guard';
import {UserComponent} from '../user.component';
import {UserDetailsComponent} from '../user-children/user-details/user-details.component';
import {UserListComponent} from '../user-children/user-list/user-list.component';

export const ROUTE_PARAM_USER_ID = 'userId';
export const USER_ROUTE_PATHS: any = {
    edit: 'edit',
    users: 'users',
    userId: `:${ROUTE_PARAM_USER_ID}`
};

export const USER_ROUTES: Routes = [
    {
        path: `${USER_ROUTE_PATHS.users}`,
        canActivate: [AuthenticatedAndAuthorizedGuard],
        component: UserComponent,
        children: [
            {
                path: '',
                component: UserListComponent,
            },
            {
                path: `:id`,
                canActivate: [UserDetailsGuard],
                component: UserDetailsComponent
            }
        ]
    }
];
