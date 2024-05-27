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
    select,
    Store
} from '@ngrx/store';
import {
    Observable,
    of
} from 'rxjs';
import {
    catchError,
    debounceTime,
    map,
    switchMap,
    withLatestFrom
} from 'rxjs/operators';

import {
    CompanyActions,
    CompanyActionsEnum
} from './company.actions';
import {CompanyResource} from '../api/resources/company.resource';
import {CompanyService} from '../api/company.service';
import {CompanyQueries} from './company.queries';
import {REQUEST_DEBOUNCE_TIME} from '../../../shared/misc/constants/general.constants';
import {State} from '../../../app.reducers';

const TRIGGER_REQUEST_COMPANIES_ACTIONS: string[] = [
    CompanyActionsEnum.SetPage,
    CompanyActionsEnum.SetSort,
    CompanyActionsEnum.SetFilter,
    CompanyActionsEnum.CreateOneFulfilled,
    CompanyActionsEnum.DeleteOneFulfilled,
    CompanyActionsEnum.SetPageSize,
];

@Injectable()
export class CompanyEffects {

    private _companyQueries: CompanyQueries = new CompanyQueries(this._store);

    constructor(private _actions$: Actions,
                private _companyService: CompanyService,
                private _store: Store<State>) {
    }

    /**
     * @description Create company interceptor
     * @type {Observable<Action>}
     */
    public create$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(CompanyActionsEnum.CreateOne),
            switchMap((action: CompanyActions.Create.One) =>
                this._companyService
                    .create(action.payload)
                    .pipe(
                        map((company: CompanyResource) => new CompanyActions.Create.OneFulfilled(company)),
                        catchError(() => of(new CompanyActions.Create.OneRejected())))
            )));

    /**
     * @description Delete company interceptor
     * @type {Observable<Action>}
     */
    public delete$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(CompanyActionsEnum.DeleteOne),
            switchMap((action: CompanyActions.Delete.One) => {
                const {id, version} = action;
                return this._companyService
                    .delete(id, version)
                    .pipe(
                        map(() => new CompanyActions.Delete.OneFulfilled(action.id)),
                        catchError(() => of(new CompanyActions.Delete.OneRejected())));
            })));

    /**
     * @description Update company interceptor
     * @type {Observable<Action>}
     */
    public update$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(CompanyActionsEnum.UpdateOne),
            switchMap((action: CompanyActions.Update.One) => {
                const {companyId, payload, version} = action;
                return this._companyService
                    .update(companyId, payload, version)
                    .pipe(
                        map((company) => new CompanyActions.Update.OneFulfilled(company)),
                        catchError(() => of(new CompanyActions.Update.OneRejected())));
            })));

    public requestPage$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(CompanyActionsEnum.RequestPage),
            withLatestFrom(this._store
                .pipe(
                    select(this._companyQueries.getSlice()))),
            switchMap(([, companySlice]) => {
                const {pageNumber, pageSize} = companySlice.list.pagination;
                const {sort, filter} = companySlice.list;
                return this._companyService
                    .findCompanies(pageNumber, pageSize, sort, filter)
                    .pipe(
                        map((companies) => new CompanyActions.Request.PageFulfilled(companies)),
                        catchError(() => of(new CompanyActions.Request.PageRejected())));
            })));

    /**
     * @description Request find company interceptor
     * @type {Observable<Action>}
     */
    public requestCompany$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(CompanyActionsEnum.RequestOne),
            switchMap((action: CompanyActions.Request.RequestOne) =>
                this._companyService
                    .findOne(action.id)
                    .pipe(
                        map((company: CompanyResource) => new CompanyActions.Request.RequestOneFulfilled(company)),
                        catchError(() => of(new CompanyActions.Request.RequestOneRejected())))
            )));

    /**
     * @description Request suggestions interceptor
     * @type {Observable<Action>}
     */
    public requestSuggestions$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(CompanyActionsEnum.RequestSuggestions),
            debounceTime(REQUEST_DEBOUNCE_TIME),
            switchMap((action: CompanyActions.Request.RequestSuggestions) =>
                this._companyService
                    .findSuggestions(action.payload)
                    .pipe(
                        map((suggestions) => new CompanyActions.Request.RequestSuggestionsFulfilled(suggestions))
                    )
            )));

    public triggerRequestCompaniesActions$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(...TRIGGER_REQUEST_COMPANIES_ACTIONS),
            debounceTime(REQUEST_DEBOUNCE_TIME),
            switchMap(() => of(new CompanyActions.Request.Page()))));
}
