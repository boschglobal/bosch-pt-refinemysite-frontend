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
import {
    distinctUntilChanged,
    filter,
    map,
    take
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {BaseQueries} from '../../../../shared/misc/store/base.queries';
import {WorkareaResource} from '../../api/workareas/resources/workarea.resource';
import {WorkareaListLinks} from '../../api/workareas/resources/workarea-list.resource';
import {WorkareaSlice} from './workarea.slice';

@Injectable({
    providedIn: 'root',
})
export class WorkareaQueries extends BaseQueries<WorkareaResource, WorkareaSlice, WorkareaListLinks> {

    public moduleName = 'projectModule';
    public sliceName = 'workareaSlice';

    constructor(private _store: Store<State>) {
        super();
    }

    public observeWorkareas(): Observable<WorkareaResource[]> {
        return this._store
            .pipe(
                select(this.getList()),
                distinctUntilChanged(isEqual));
    }

    public observeWorkareaById(id: string): Observable<WorkareaResource> {
        return this._store
            .pipe(
                select(this.getItemById(id)),
                filter(item => !!item),
                distinctUntilChanged());
    }

    public observeWorkareasRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getListRequestStatus()),
                distinctUntilChanged());
    }

    public observeCreateWorkareaPermission(): Observable<boolean> {
        return this._store
            .pipe(
                select(this.getListLinks()),
                map((links: WorkareaListLinks) => links.hasOwnProperty('create')),
                distinctUntilChanged());
    }

    public observeCurrentWorkareaRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getCurrentItemRequestStatus()),
                distinctUntilChanged());
    }

    public hasCreatePermission(): boolean {
        let hasCreate: boolean;
        this.observeCreateWorkareaPermission()
            .pipe(
                take(1))
            .subscribe(permission => hasCreate = permission)
            .unsubscribe();
        return hasCreate;
    }
}
