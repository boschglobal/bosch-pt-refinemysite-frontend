/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router
} from '@angular/router';

import {UserQueries} from '../../store/user/user.queries';

@Injectable({
    providedIn: 'root',
})
export class CanEditProfileGuard implements CanActivate {

    constructor(private _router: Router,
                private _userQueries: UserQueries) {
    }

    public canActivate(route: ActivatedRouteSnapshot) {
        if (this._userQueries.hasEditProfilePermission()) {
            return true;
        } else {
            this._router.navigate(['unauthorized']);
            return false;
        }
    }
}
