/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Routes} from '@angular/router';

import {AuthenticatedAndRegisteredGuard} from '../../auth/auth-routing/guards/authenticated-and-registered.guard';
import {NavBarRawItem} from '../../shared/navigation/components/navbar-component/navbar.component';
import {NavigationRouteData} from '../../shared/navigation/interfaces/navigation-route-data';
import {UserComponent} from '../user.component';
import {UserChildrenComponent} from '../user-children/user-children.component';
import {UserEditComponent} from '../user-children/user-edit/containers/user-edit-component/user-edit.component';
import {UserProfileComponent} from '../user-children/user-profile/containers/user-profile-component/user-profile.component';
import {CanEditProfileGuard} from './guards/can-edit-profile.guard';
import {UserProfileGuard} from './guards/user-profile.guard';

export const ROUTE_PARAM_USER_ID = 'userId';
export const USER_ROUTE_PATHS: { [key: string]: string } = {
    edit: 'edit',
    information: 'information',
    users: 'users',
    userId: `:${ROUTE_PARAM_USER_ID}`,
};

const fixedNavBarItems: NavBarRawItem[] = [
    {
        staticLabel: 'Generic_ProjectLabel',
        icon: 'home',
        url: '/projects/list',
        permissions: true,
        exact: true,
    },
];

export const USERS_ROUTE_DATA: { [key: string]: NavigationRouteData } = {
    users: {
        breadcrumb: {staticLabel: 'Generic_MyProfileLabel'},
        menu: fixedNavBarItems,
    },
    edit: {
        breadcrumb: {staticLabel: 'Generic_EditProfileLabel'},
        menu: fixedNavBarItems,
    },
};

export const USER_ROUTES: Routes = [
    {
        path: `${USER_ROUTE_PATHS.users}/${USER_ROUTE_PATHS.userId}`,
        canActivate: [AuthenticatedAndRegisteredGuard],
        component: UserComponent,
        children: [
            {
                path: '',
                canActivate: [UserProfileGuard],
                component: UserChildrenComponent,
                children: [
                    {
                        path: '',
                        redirectTo: USER_ROUTE_PATHS.information,
                        pathMatch: 'prefix',
                    },
                    {
                        path: USER_ROUTE_PATHS.information,
                        component: UserProfileComponent,
                        data: USERS_ROUTE_DATA.users,
                    },
                    {
                        path: USER_ROUTE_PATHS.edit,
                        component: UserEditComponent,
                        canActivate: [CanEditProfileGuard],
                        data: USERS_ROUTE_DATA.edit,
                    },
                ],
            },
        ],
    },
];
