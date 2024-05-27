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
import {Observable} from 'rxjs';
import {
    map,
    tap
} from 'rxjs/operators';

import {UserQueries} from '../../store/user/user.queries';

@Injectable({
    providedIn: 'root',
})
export class UserProfileGuard implements CanActivate {

    constructor(private _router: Router,
                private _userQueries: UserQueries) {
    }

    public canActivate(childRoute: ActivatedRouteSnapshot): Observable<boolean> {
        return this._userQueries.observeCurrentUser()
            .pipe(
                map(user => !!user && user.id === childRoute.params.userId),
                tap(isValidUser => {
                    if (!isValidUser) {
                        this._router.navigate(['unauthorized']);
                    }
                })
            );
    }
}
