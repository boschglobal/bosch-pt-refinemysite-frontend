
/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {CanDeactivate} from '@angular/router';
import {Store} from '@ngrx/store';

import {CompanyActions} from '../../company-common/store/company.actions';
import {EmployeeActions} from '../../../employee/employee-common/store/employee.actions';
import {State} from '../../../app.reducers';

@Injectable({
    providedIn: 'root',
})
export class CanDeactivateCompanyDetailsGuard implements CanDeactivate<boolean> {

    constructor(private _store: Store<State>) {
    }

    canDeactivate(): boolean {
        this._store.dispatch(new EmployeeActions.Initialize.All());
        this._store.dispatch(new CompanyActions.Initialize.Current());

        return true;
    }
}
