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
import {ConstraintEntity} from '../../entities/constraints/constraint';
import {ConstraintSlice} from './constraint.slice';

@Injectable({
    providedIn: 'root',
})
export class ConstraintQueries extends BaseQueries<ConstraintEntity, ConstraintSlice, AbstractItemsResourceLinks> {
    public moduleName = 'projectModule';

    public sliceName = 'constraintSlice';

    constructor(private _store: Store<State>) {
        super();
    }

    public observeConstraintList(): Observable<ConstraintEntity[]> {
        return this._store
            .pipe(
                select(this.getList()),
                distinctUntilChanged(isEqual));
    }

    public observeConstraintListRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getListRequestStatus()),
                distinctUntilChanged());
    }

    public observeActiveConstraintList(): Observable<ConstraintEntity[]> {
        return this._store
            .pipe(
                select(this.getList()),
                distinctUntilChanged(isEqual),
                map(constraints => constraints.filter(constraint => constraint.active)));
    }
}
