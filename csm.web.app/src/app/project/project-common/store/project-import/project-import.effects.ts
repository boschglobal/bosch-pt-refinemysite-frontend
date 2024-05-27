/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    Actions,
    createEffect,
    ofType,
} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {
    Observable,
    of,
} from 'rxjs';
import {
    catchError,
    map,
    mergeMap,
    switchMap,
    withLatestFrom,
} from 'rxjs/operators';

import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {ProjectImportService} from '../../api/project-import/project-import.service';
import {ProjectImportAnalyzeResource} from '../../api/project-import/resources/project-import-analyze.resource';
import {ProjectImportUploadResource} from '../../api/project-import/resources/project-import-upload.resource';
import {ProjectSliceService} from '../projects/project-slice.service';
import {
    ProjectImportActionEnum,
    ProjectImportActions,
} from './project-import.actions';

@Injectable()
export class ProjectImportEffects {

    constructor(private _actions$: Actions,
                private _projectImportService: ProjectImportService,
                private _projectSliceService: ProjectSliceService) {
    }

    public uploadOne$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(ProjectImportActionEnum.UploadOne),
            withLatestFrom(
                this._projectSliceService.observeCurrentProjectId(),
            ),
            switchMap(([action, projectId]: [ProjectImportActions.Upload.One, string]) =>
                this._projectImportService.upload(projectId, action.file)
                    .pipe(
                        map((result: ProjectImportUploadResource) => new ProjectImportActions.Upload.OneFulfilled(result)),
                        catchError(() => of(new ProjectImportActions.Upload.OneRejected())))
            )));

    public analyzeOne$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(ProjectImportActionEnum.AnalyzeOne),
            withLatestFrom(
                this._projectSliceService.observeCurrentProjectId(),
            ),
            switchMap(([action, projectId]: [ProjectImportActions.Analyze.One, string]) =>
                this._projectImportService.analyze(projectId, action.payload, action.version)
                    .pipe(
                        map((result: ProjectImportAnalyzeResource) => new ProjectImportActions.Analyze.OneFulfilled(result)),
                        catchError(() => of(new ProjectImportActions.Analyze.OneRejected())))
            )));

    public importOne$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(ProjectImportActionEnum.ImportOne),
            withLatestFrom(
                this._projectSliceService.observeCurrentProjectId(),
            ),
            switchMap(([action, projectId]: [ProjectImportActions.Import.One, string]) =>
                this._projectImportService.import(projectId, action.version)
                    .pipe(
                        mergeMap(({id}) => [
                            new ProjectImportActions.Import.OneFulfilled(id),
                            new AlertActions.Add.NeutralAlert(
                                {message: new AlertMessageResource('Job_ProjectImportCard_RunningStatusTitle')}),
                        ]),
                        catchError(() => of(new ProjectImportActions.Import.OneRejected())))
            )));
}
