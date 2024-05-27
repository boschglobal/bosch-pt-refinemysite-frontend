/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    switchMap,
    catchError,
    map,
    debounceTime
} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {
    Actions,
    createEffect,
    ofType
} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {
    Observable,
    of
} from 'rxjs';

import {REQUEST_DEBOUNCE_TIME} from '../../../shared/misc/constants/general.constants';
import {UserResource} from '../../api/resources/user.resource';
import {UserService} from '../../api/user.service';
import {
    UserActionEnum,
    UserActions,
} from './user.actions';

@Injectable()
export class UserEffects {

    constructor(private _actions$: Actions,
                private _userService: UserService) {
    }

    /**
     * @description Request Authenticated User interceptor
     * @type {Observable<Action>}
     */
    public requestAuthenticatedUser$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(UserActionEnum.RequestAuthenticatedUser),
            switchMap(() =>
                this._userService
                    .findAuthenticatedUser()
                    .pipe(
                        map((userResource: UserResource) => new UserActions.Request.AuthenticatedUserFulfilled(userResource)),
                        catchError(() => of(new UserActions.Request.AuthenticatedUserRejected())))
            )));

    /**
     * @description Request one user interceptor
     * @type {Observable<Action>}
     */
    public requestOne$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(UserActionEnum.RequestOne),
            switchMap((action: UserActions.Request.One) =>
                this._userService
                    .findOne(action.userId)
                    .pipe(
                        map((userResource: UserResource) => new UserActions.Request.OneFulfilled(userResource)),
                        catchError(() => of(new UserActions.Request.OneRejected())))
            )));

    /**
     * @description Request suggestions interceptor
     * @type {Observable<Action>}
     */
    public requestSuggestions$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(UserActionEnum.RequestSuggestions),
            debounceTime(REQUEST_DEBOUNCE_TIME),
            switchMap((action: UserActions.Request.RequestSuggestions) =>
                this._userService
                    .findSuggestions(action.payload)
                    .pipe(
                        map((suggestions) =>
                            new UserActions.Request.RequestSuggestionsFulfilled(suggestions)
                        ))
            )));

    /**
     * @description Set admin interceptor
     * @type {Observable<Action>}
     */
    public setAdmin$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(UserActionEnum.SetAdmin),
            switchMap((action: UserActions.Set.Admin) =>
                this._userService
                    .setAdmin(action.userId, action.payload, action.version)
                    .pipe(
                        map((user: UserResource) => new UserActions.Set.AdminFulfilled(user)),
                        catchError(() => of(new UserActions.Set.AdminRejected())))
            )));

    /**
     * @description Set lock interceptor
     * @type {Observable<Action>}
     */
    public setLock$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(UserActionEnum.SetLock),
            switchMap((action: UserActions.Set.Lock) =>
                this._userService
                    .setLock(action.userId, action.payload, action.version)
                    .pipe(
                        map((user: UserResource) => new UserActions.Set.LockFulfilled(user)),
                        catchError(() => of(new UserActions.Set.LockRejected())))
            )));

    /**
     * @description Delete user interceptor
     * @type {Observable<Action>}
     */
    public deleteUser$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(UserActionEnum.DeleteOne),
            switchMap((action: UserActions.Delete.One) =>
                this._userService
                    .delete(action.userId, action.version)
                    .pipe(
                        map(() => new UserActions.Delete.OneFulfilled(action.userId)),
                        catchError(() => of(new UserActions.Delete.OneRejected())))
            )));
}
