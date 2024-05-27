/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
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
import {
    distinctUntilChanged,
    map
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {AbstractItemsResourceLinks} from '../../../../shared/misc/api/resources/abstract-items.resource';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {BaseQueries} from '../../../../shared/misc/store/base.queries';
import {RfvEntity} from '../../entities/rfvs/rfv';
import {RfvSlice} from './rfv.slice';

@Injectable({
    providedIn: 'root',
})
export class RfvQueries extends BaseQueries<RfvEntity, RfvSlice, AbstractItemsResourceLinks> {
    public moduleName = 'projectModule';

    public sliceName = 'rfvSlice';

    constructor(private _store: Store<State>) {
        super();
    }

    public observeRfvList(): Observable<RfvEntity[]> {
        return this._store
            .pipe(
                select(this.getList()),
                distinctUntilChanged(isEqual));
    }

    public observeRfvListRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getListRequestStatus()),
                distinctUntilChanged());
    }

    public observeActiveRfvList(): Observable<RfvEntity[]> {
        return this._store
            .pipe(
                select(this.getList()),
                distinctUntilChanged(isEqual),
                map(rfvs => rfvs.filter(rfv => rfv.active)));
    }
}
