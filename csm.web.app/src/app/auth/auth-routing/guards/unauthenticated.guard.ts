/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    CanActivate,
    Router
} from '@angular/router';
import {
    map,
    tap
} from 'rxjs/operators';

import {AuthService} from '../../../shared/authentication/services/auth.service';
import {AUTH_ROUTE_PATHS} from '../auth-routes.paths';

@Injectable({
    providedIn: 'root',
})
export class UnauthenticatedGuard implements CanActivate {

    constructor(private _router: Router,
                private _authService: AuthService) {
    }

    public canActivate() {
        return this._authService.isAuthenticated()
            .pipe(
                tap(isAuthenticated => {
                    if (isAuthenticated) {
                        this._router.navigateByUrl(`${AUTH_ROUTE_PATHS.authentication}/${AUTH_ROUTE_PATHS.signup}`);
                    }
                }),
                map(isAuthenticated => !isAuthenticated)
            );
    }
}
