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
import {
    Action,
    Store
} from '@ngrx/store';
import {Observable} from 'rxjs';
import {
    map,
    take
} from 'rxjs/operators';

import {
    CompanyActions,
    CompanyActionsEnum,
} from '../../company-common/store/company.actions';
import {CompanyQueries} from '../../company-common/store/company.queries';
import {FeatureAction} from '../../../feature/feature-common/store/feature.actions';
import {State} from '../../../app.reducers';

@Injectable({
    providedIn: 'root',
})
export class CompanyListResolverGuard implements CanActivate {

    constructor(private _actions: Actions,
                private _companyQueries: CompanyQueries,
                private _store: Store<State>) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
        const currentItemId: string = route.paramMap.get('id');
        const hasItemInCache: boolean = this._companyQueries.hasCompanyById(currentItemId);
        let _canActivate: Observable<boolean> | boolean;

        this._store.dispatch(new CompanyActions.Set.Current(currentItemId));
        this._store.dispatch(new FeatureAction.Initialize.All());

        if (hasItemInCache) {
            _canActivate = hasItemInCache;
        } else {
            this._store.dispatch(new CompanyActions.Request.RequestOne(currentItemId));
            _canActivate = this._actions
                .pipe(
                    ofType(CompanyActionsEnum.RequestOneFulfilled, CompanyActionsEnum.RequestOneRejected),
                    take(1),
                    map((action: Action) => action.type === CompanyActionsEnum.RequestOneFulfilled));
        }

        return _canActivate;
    }
}
