/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router
} from '@angular/router';
import {
    Actions, ofType
} from '@ngrx/effects';
import {Injectable} from '@angular/core';
import {
    Action,
    Store
} from '@ngrx/store';
import {
    Observable,
    combineLatest
} from 'rxjs';
import {
    take,
    map
} from 'rxjs/operators';

import {
    EmployeeActions,
    EmployeeActionsEnum
} from '../../../employee/employee-common/store/employee.actions';
import {ProtectAccessGuard} from '../../../shared/misc/guard/protect-access.guard';
import {State} from '../../../app.reducers';
import {
    UserActions,
    UserActionEnum
} from '../../store/user/user.actions';

@Injectable({
    providedIn: 'root',
})
export class UserDetailsGuard extends ProtectAccessGuard implements CanActivate {

    constructor(private _actions: Actions,
                private _router: Router,
                private _store: Store<State>) {
                    super(_router);
    }

    public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
        const currentItemId: string = route.paramMap.get('id');
        const employeeId: string = route.queryParamMap.get('employeeId');

        this._store.dispatch(new UserActions.Request.One(currentItemId));
        const _userAvailable: Observable<boolean> = this._actions
            .pipe(
                ofType(UserActionEnum.RequestOneFulfilled, UserActionEnum.RequestOneRejected),
                take(1),
                map((action: Action) => {
                    const successful = action.type === UserActionEnum.RequestOneFulfilled;
                    if (!successful) {
                        this._handleUnauthorized();
                    }
                    return successful;
                }));

        if (employeeId) {
            this._store.dispatch(new EmployeeActions.Request.One(employeeId));
            const _employeeAvailable = this._actions
            .pipe(
                ofType(EmployeeActionsEnum.RequestOneFulfilled, EmployeeActionsEnum.RequestOneRejected),
                take(1),
                map((action: Action) => {
                    const successful = action.type === EmployeeActionsEnum.RequestOneFulfilled;
                    if (!successful) {
                        this._handleUnauthorized();
                    }
                    return successful;
                }));
            return combineLatest([_userAvailable, _employeeAvailable]).pipe(
                map(([hasUser, hasEmployee]) => hasUser && hasEmployee));
        } else {
            this._store.dispatch(new EmployeeActions.Set.Current(undefined));
            return _userAvailable;
        }
    }
}
