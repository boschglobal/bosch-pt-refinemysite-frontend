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
    Store,
} from '@ngrx/store';
import {isEqual} from 'lodash';
import {Observable} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ProjectImportAnalyzeResource} from '../../api/project-import/resources/project-import-analyze.resource';
import {ProjectImportUploadResource} from '../../api/project-import/resources/project-import-upload.resource';
import {
    ProjectImportSlice,
    ProjectImportStep,
} from './project-import.slice';

@Injectable({
    providedIn: 'root',
})
export class ProjectImportQueries {
    public moduleName = 'projectModule';

    public sliceName = 'projectImportSlice';

    constructor(private _store: Store<State>) {
    }

    /**
     * @description Retrieves Observable with the Analyze response
     * @returns {Observable<ProjectImportAnalyzeResource>}
     */
    public observeAnalyzeResponse(): Observable<ProjectImportAnalyzeResource> {
        return this._store
            .pipe(
                select(this._getAnalyzeResponse()),
                distinctUntilChanged(isEqual));
    }

    /**
     * @description Retrieves Observable with the Upload response
     * @returns {Observable<ProjectImportUploadResource>}
     */
    public observeUploadResponse(): Observable<ProjectImportUploadResource> {
        return this._store
            .pipe(
                select(this._getUploadResponse()),
                distinctUntilChanged(isEqual));
    }

    /**
     * @description Retrieves Observable with the request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeRequestStatus(step: ProjectImportStep): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this._getRequestStatus(step)),
                distinctUntilChanged());
    }

    private _getAnalyzeResponse(): (state: State) => ProjectImportAnalyzeResource {
        return (state: State) => this._getSlice(state).analyzeResponse;
    }

    private _getUploadResponse(): (state: State) => ProjectImportUploadResource {
        return (state: State) => this._getSlice(state).uploadResponse;
    }

    private _getRequestStatus(step: ProjectImportStep): (state: State) => RequestStatusEnum {
        return (state: State) => this._getSlice(state).requestStatus[step];
    }

    private _getSlice(state: State): ProjectImportSlice {
        return state[this.moduleName][this.sliceName];
    }
}
