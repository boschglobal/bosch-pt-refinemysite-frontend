/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    switchMap,
    withLatestFrom,
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
import {
    Store,
    select,
    Action
} from '@ngrx/store';
import {
    Observable,
    of
} from 'rxjs';

import {EmployableUserQueries} from './employable-user.queries';
import {EmployableUserService} from '../../api/employable-user.service';
import {
    EmployableUserActionEnum,
    EmployableUserActions
} from './employable-user.actions';
import {REQUEST_DEBOUNCE_TIME} from '../../../shared/misc/constants/general.constants';
import {State} from '../../../app.reducers';

const TRIGGER_REQUEST_EMPLOYABLE_USERS_ACTIONS: string[] = [
    EmployableUserActionEnum.SetPage,
    EmployableUserActionEnum.SetSort,
    EmployableUserActionEnum.SetPageSize,
    EmployableUserActionEnum.SetFilter
];

@Injectable()
export class EmployableUserEffects {

    constructor(private _actions$: Actions,
                private _store: Store<State>,
                private _employableUserService: EmployableUserService,
                private _employableUserQueries: EmployableUserQueries) {
    }

    public requestPage$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(EmployableUserActionEnum.RequestPage),
            withLatestFrom(this._store
                .pipe(
                    select(this._employableUserQueries.getSlice()))),
            switchMap(([, employableUserSlice]) => {
                const {pageNumber, pageSize} = employableUserSlice.list.pagination;
                const {sort, filter} = employableUserSlice.list;
                return this._employableUserService
                    .findAll(pageNumber, pageSize, sort, filter)
                    .pipe(
                        map(employableUsers => new EmployableUserActions.Request.PageFulfilled(employableUsers)),
                        catchError(() => of(new EmployableUserActions.Request.PageRejected())));
            })));

    public triggerRequestEmployableUserActions$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(...TRIGGER_REQUEST_EMPLOYABLE_USERS_ACTIONS),
            debounceTime(REQUEST_DEBOUNCE_TIME),
            switchMap(() => of(new EmployableUserActions.Request.Page()))));
}
