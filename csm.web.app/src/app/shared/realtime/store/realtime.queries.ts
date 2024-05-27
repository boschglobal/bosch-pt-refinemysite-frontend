/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    select,
    Store
} from '@ngrx/store';
import {isEqual} from 'lodash';
import {Observable} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';

import {State} from '../../../app.reducers';
import {ObjectIdentifierPair} from '../../misc/api/datatypes/object-identifier-pair.datatype';

@Injectable({
    providedIn: 'root',
})
export class RealtimeQueries {

    private readonly _sliceName = 'realtimeSlice';

    constructor(private _store: Store<State>) {
    }

    /**
     * @description Retrieves Observable of current context
     * @returns {Observable<ObjectIdentifierPair>}
     */
    public observeContext(): Observable<ObjectIdentifierPair> {
        return this._store
            .pipe(
                select(this._getContext()),
                distinctUntilChanged(isEqual));
    }

    private _getContext(): (state: State) => ObjectIdentifierPair {
        return (state: State) => {
            return state[this._sliceName].context;
        };
    }
}
