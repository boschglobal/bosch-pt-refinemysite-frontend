/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    select,
    Store
} from '@ngrx/store';
import {Observable} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {BaseQueries} from '../../../../shared/misc/store/base.queries';
import {ProjectExportResource} from '../../api/project-export/resources/project-export.resource';
import {ProjectExportSlice} from './project-export.slice';

@Injectable({
    providedIn: 'root',
})
export class ProjectExportQueries extends BaseQueries<ProjectExportResource, ProjectExportSlice> {

    public moduleName = 'projectModule';

    public sliceName = 'projectExportSlice';

    constructor(private _store: Store<State>) {
        super();
    }

    /**
     * @description Retrieves an observable with the current export request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeProjectExportRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getCurrentItemRequestStatus()),
                distinctUntilChanged());
    }
}
