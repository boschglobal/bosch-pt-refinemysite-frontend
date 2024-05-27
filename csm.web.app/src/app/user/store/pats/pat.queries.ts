/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
} from 'rxjs/operators';

import {State} from '../../../app.reducers';
import {PATResource} from '../../../project/project-common/api/pats/resources/pat.resource';
import {PATListLinks} from '../../../project/project-common/api/pats/resources/pat-list.resource';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {BaseQueries} from '../../../shared/misc/store/base.queries';
import {PATSlice} from './pat.slice';

@Injectable({
    providedIn: 'root',
})
export class PATQueries extends BaseQueries<PATResource, PATSlice, PATListLinks> {

    public moduleName = 'userModule';
    public sliceName = 'patSlice';

    constructor(private _store: Store<State>) {
        super();
    }

    public observeCurrentItem(): Observable<PATResource> {
        return this._store
            .pipe(
                select(this._getCurrentItem()),
                distinctUntilChanged());
    }

    public observePATById(id: string): Observable<PATResource> {
        return this._store
            .pipe(
                select(this.getItemById(id)),
                filter(item => !!item),
                distinctUntilChanged());
    }

    public observePATs(): Observable<PATResource[]> {
        return this._store
            .pipe(
                select(this.getList()),
                distinctUntilChanged(isEqual));
    }

    public observePATsRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getListRequestStatus()),
                distinctUntilChanged());
    }

    public observeCurrentPATRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getCurrentItemRequestStatus()),
                distinctUntilChanged());
    }

    private _getCurrentItem(): (state: State) => PATResource {
        return (state: State) => {
            const slice = this._getSlice(state);
            const currentItemId = slice.currentItem.id;

            return slice.items.find(item => item.id === currentItemId);
        };
    }
}
