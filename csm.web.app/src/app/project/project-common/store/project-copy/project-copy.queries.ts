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
import {CreateProjectCopyResource} from '../../api/project-copy/resources/create-project-copy.resource';
import {ProjectCopySlice} from './project-copy.slice';

@Injectable({
    providedIn: 'root',
})
export class ProjectCopyQueries extends BaseQueries<CreateProjectCopyResource, ProjectCopySlice> {

    public moduleName = 'projectModule';

    public sliceName = 'projectCopySlice';

    constructor(private _store: Store<State>) {
        super();
    }

    /**
     * @description Retrieves Observable of current participant request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeCurrentProjectCopyRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getCurrentItemRequestStatus()),
                distinctUntilChanged());
    }
}
