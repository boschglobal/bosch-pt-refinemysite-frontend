/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';
import {
    BehaviorSubject,
    Observable
} from 'rxjs';
import {map} from 'rxjs/operators';

export class MockStore<T> extends BehaviorSubject<T> {
    constructor(private _initialState: T) {
        super(_initialState);
    }

    dispatch = (action: Action): void => {
    }

    select = <T, R>(pathOrMapFn: any, ...paths: string[]): Observable<R> => {
        return map.call(this, pathOrMapFn);
    }

    nextMock(mock: T) {
        this.next(mock);
    }
}
