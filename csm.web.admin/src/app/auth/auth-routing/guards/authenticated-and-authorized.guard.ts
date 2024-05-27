/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot
} from '@angular/router';
import {
    Observable,
    of
} from 'rxjs';
import {Store} from '@ngrx/store';
import {
    switchMap,
    take,
    tap
} from 'rxjs/operators';
import {
    Actions,
    ofType
} from '@ngrx/effects';

import {State} from '../../../app.reducers';
import {AuthService} from '../../../shared/auth/auth.service';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {
    UserActionEnum,
    UserActions
} from '../../../user/store/user/user.actions';
import {UserQueries} from '../../../user/store/user/user.queries';
import {AUTH_ROUTE_PATHS} from '../auth-routes.paths';

@Injectable({
    providedIn: 'root',
})
export class AuthenticatedAndAuthorizedGuard implements CanActivate {

    constructor(private _actions: Actions,
                private _authService: AuthService,
                private _router: Router,
                private _userQueries: UserQueries,
                private _store: Store<State>) {
    }

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this._authService.isAuthenticated()
            .pipe(
                tap((isAuthenticated: boolean) => {
                    if (!isAuthenticated) {
                        this._authService.saveRequestedPathAndRedirect(state.url);
                    }
                }),
                switchMap((isAuthenticated: boolean) => isAuthenticated ? this._isAuthorizedUser() : of(false)),
            );
    }

    private _isAuthorizedUser(): Observable<boolean> {
        if (this._userQueries.isAuthenticatedUserLoaded()) {
            return this._isAdminUser();
        } else {
            if (this._userQueries.getCurrentUserRequestStatus() !== RequestStatusEnum.Progress) {
                this._store.dispatch(new UserActions.Request.AuthenticatedUser());
            }

            return this._actions
                .pipe(
                    ofType(UserActionEnum.RequestAuthenticatedUserFulfilled, UserActionEnum.RequestAuthenticatedUserRejected),
                    take(1),
                    switchMap(() => this._isAdminUser()),
                );
        }
    }

    private _isAdminUser(): Observable<boolean> {
        const isAdmin = this._userQueries.isAdminUser();

        if (!isAdmin) {
            this._router.navigate([`${AUTH_ROUTE_PATHS.authentication}/${AUTH_ROUTE_PATHS.unauthorized}`]);
        }

        return of(isAdmin);
    }
}
