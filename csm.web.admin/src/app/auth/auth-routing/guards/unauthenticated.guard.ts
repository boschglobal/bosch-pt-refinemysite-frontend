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
import {Observable} from 'rxjs';

import {AuthService} from '../../../shared/auth/auth.service';
import {UserQueries} from '../../../user/store/user/user.queries';

@Injectable({
    providedIn: 'root',
})
export class UnauthenticatedGuard implements CanActivate {

    constructor(private _authService: AuthService,
                private _router: Router,
                private _userQueries: UserQueries) {
    }

    public canActivate(): Observable<boolean> {
        return this._authService.isAuthenticated().pipe(
            tap(isAuthenticated => {
                if (isAuthenticated) {
                    this._router.navigate(['/']);
                }
            }),
            map(isAuthenticated => !isAuthenticated)
        );
    }
}
