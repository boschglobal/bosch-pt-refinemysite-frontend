/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    Actions,
    createEffect,
    ofType
} from '@ngrx/effects';
import {
    Action,
    Store,
    select
} from '@ngrx/store';
import {
    Observable,
    of,
    EMPTY
} from 'rxjs';
import {
    catchError,
    map,
    switchMap,
    withLatestFrom,
    debounceTime
} from 'rxjs/operators';

import {CompanyQueries} from '../../../company/company-common/store/company.queries';
import {
    EmployeeActions,
    EmployeeActionsEnum
} from './employee.actions';
import {EmployeeQueries} from './employee.queries';
import {EmployeeResource} from '../api/resources/employee.resource';
import {EmployeeService} from '../api/employee.service';
import {State} from '../../../app.reducers';

const TRIGGER_REQUEST_EMPLOYEES_ACTIONS: string[] = [
    EmployeeActionsEnum.SetPage,
    EmployeeActionsEnum.SetPageSize,
    EmployeeActionsEnum.SetSort,
    EmployeeActionsEnum.CreateOneFulfilled,
    EmployeeActionsEnum.DeleteOneFulfilled,
];

@Injectable()
export class EmployeeEffects {

    constructor(private _actions$: Actions,
                private _companyQueries: CompanyQueries,
                private _employeeQueries: EmployeeQueries,
                private _employeeService: EmployeeService,
                private _store: Store<State>) {
    }

    /**
     * @description Create employee interceptor
     * @type {Observable<Action>}
     */
    public create$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(EmployeeActionsEnum.CreateOne),
            switchMap((action: EmployeeActions.Create.One) => {
                const {companyId, payload} = action;
                return this._employeeService
                    .create(companyId, payload)
                    .pipe(
                        map((employee: EmployeeResource) => new EmployeeActions.Create.OneFulfilled(employee)),
                        catchError(() => of(new EmployeeActions.Create.OneRejected())));
            })));

    /**
     * @description Delete employee interceptor
     * @type {Observable<Action>}
     */
    public delete$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(EmployeeActionsEnum.DeleteOne),
            switchMap((action: EmployeeActions.Delete.One) => {
                const {id, version} = action;
                return this._employeeService
                    .delete(id, version)
                    .pipe(
                        map(() => new EmployeeActions.Delete.OneFulfilled(action.id)),
                        catchError(() => of(new EmployeeActions.Delete.OneRejected())));
            })));

    /**
     * @description Request employee page interceptor
     * We verify if the company id is not null because we make requests to update and delete users from the user details
     * @type {Observable<Action>}
     */
    public requestPage$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(EmployeeActionsEnum.RequestPage),
            withLatestFrom(
                this._store.pipe(select(this._employeeQueries.getSlice())),
                this._store.pipe(select(this._companyQueries.getSlice()))
            ),
            switchMap(([, employeeSlice, companySlice]) => {
                const {pageNumber, pageSize} = employeeSlice.list.pagination;
                const sort = employeeSlice.list.sort;
                const companyId = companySlice.currentItem?.id;

                if (companyId) {
                    return this._employeeService
                        .findAll(companyId, pageNumber, pageSize, sort)
                        .pipe(
                            map((employess) => new EmployeeActions.Request.RequestPageFulfilled(employess)),
                            catchError(() => of(new EmployeeActions.Request.RequestPageRejected())));
                } else {
                    return EMPTY;
                }
            })));

    public triggerRequestEmployeesActions$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(...TRIGGER_REQUEST_EMPLOYEES_ACTIONS),
            debounceTime(300),
            switchMap(() => of(new EmployeeActions.Request.RequestPage()))));

    /**
     * @description Update employee interceptor
     * @type {Observable<Action>}
     */
    public update$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(EmployeeActionsEnum.UpdateOne),
            switchMap((action: EmployeeActions.Update.One) => {
                const {employeeId, payload, version} = action;
                return this._employeeService
                    .update(employeeId, payload, version)
                    .pipe(
                        map((employee: EmployeeResource) => new EmployeeActions.Update.OneFulfilled(employee)),
                        catchError(() => of(new EmployeeActions.Update.OneRejected())));
            })));

    /**
     * @description Request find employee interceptor
     * @type {Observable<Action>}
     */
    public requestEmployee$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(EmployeeActionsEnum.RequestOne),
            switchMap((action: EmployeeActions.Request.One) =>
                this._employeeService
                    .findOne(action.id)
                    .pipe(
                        map((employee: EmployeeResource) => new EmployeeActions.Request.OneFulfilled(employee)),
                        catchError(() => of(new EmployeeActions.Request.OneRejected())))
            )));
}
