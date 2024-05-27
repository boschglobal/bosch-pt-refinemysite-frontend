/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Observable,
    ReplaySubject
} from 'rxjs';

import {ObjectIdentifierPair} from '../../app/shared/misc/api/datatypes/object-identifier-pair.datatype';

export class RealtimeQueriesStub {

    constructor(private _context$: ReplaySubject<ObjectIdentifierPair>) {
    }

    public observeContext(): Observable<ObjectIdentifierPair> {
        return this._context$;
    }
}
