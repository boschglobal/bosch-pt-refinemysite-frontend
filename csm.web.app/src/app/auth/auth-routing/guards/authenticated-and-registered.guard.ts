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
    RouterStateSnapshot
} from '@angular/router';
import {
    Actions,
    ofType
} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {
    Observable,
    of
} from 'rxjs';
import {
    map,
    switchMap,
    take,
    tap
} from 'rxjs/operators';

import {State} from '../../../app.reducers';
import {AuthService} from '../../../shared/authentication/services/auth.service';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {
    UserActionEnum,
    UserActions
} from '../../../user/store/user/user.actions';
import {UserQueries} from '../../../user/store/user/user.queries';

@Injectable({
    providedIn: 'root',
})
export class AuthenticatedAndRegisteredGuard implements CanActivate {

    constructor(private _actions: Actions,
                private _authService: AuthService,
                private _store: Store<State>,
                private _userQueries: UserQueries) {
    }

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this._authService.isAuthenticated()
            .pipe(
                tap((isAuthenticated: boolean) => {
                    if (!isAuthenticated) {
                        this._authService.saveRequestedPathAndRedirect(state.url);
                    }
                }),
                switchMap((isAuthenticated: boolean) => isAuthenticated ? this._isRegisteredUser(state) : of(false)),
            );
    }

    private _isRegisteredUser(state: RouterStateSnapshot): Observable<boolean> {
        if (this._userQueries.isCurrentUserLoaded()) {
            return of(true);
        } else {
            if (this._userQueries.getCurrentUserRequestStatus() !== RequestStatusEnum.progress) {
                this._store.dispatch(new UserActions.Request.Current());
            }

            return this._actions
                .pipe(
                    ofType(UserActionEnum.RequestCurrentFulfilled, UserActionEnum.RequestCurrentRejected),
                    take(1),
                    map(() => !!this._userQueries.isCurrentUserLoaded()),
                    tap((isRegistered: boolean) => {
                        if (!isRegistered) {
                            this._authService.saveRequestedPathAndRedirect(state.url);
                        }
                    }),
                );
        }
    }
}
