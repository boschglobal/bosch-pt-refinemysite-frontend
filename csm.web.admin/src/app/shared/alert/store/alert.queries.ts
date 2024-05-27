/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';
import {isEqual} from 'lodash';
import {
    select,
    Store
} from '@ngrx/store';

import {AlertResource} from '../api/resources/alert.resource';
import {State} from '../../../app.reducers';

@Injectable({
    providedIn: 'root',
})
export class AlertQueries {

    constructor(private _store: Store<State>) {
    }

    public observeAlerts(): Observable<AlertResource[]> {
        return this._store
            .pipe(
                select(this._getAlerts()),
                distinctUntilChanged(isEqual),
            );
    }

    private _getAlerts(): (state: State) => AlertResource[] {
        return (state: State) => state.alertSlice.alerts;
    }
}
