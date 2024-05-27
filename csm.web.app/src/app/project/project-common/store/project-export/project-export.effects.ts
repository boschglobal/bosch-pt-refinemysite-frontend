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
    ofType
} from '@ngrx/effects';
import {of} from 'rxjs';
import {
    catchError,
    mergeMap,
    switchMap
} from 'rxjs/operators';

import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {ProjectExportService} from '../../api/project-export/project-export.service';
import {
    ExportProjectActionsEnum,
    ProjectExportAction
} from './project-export.actions';

@Injectable()
export class ProjectExportEffects {
    constructor(private _actions$: Actions,
                private _projectExportService: ProjectExportService) {
    }

    /**
     * @description Export project interceptor
     * @type {Observable<Action>}
     */
    public exportProject$ = createEffect(() => this._actions$
        .pipe(
            ofType(ExportProjectActionsEnum.ExportOne),
            switchMap( ({projectId, projectExportResource}: ProjectExportAction.Export.One) =>
                this._projectExportService.getFile(projectId, projectExportResource)
                    .pipe(
                        mergeMap( ({id}) => {
                            const {format} = projectExportResource;
                            return [
                                new ProjectExportAction.Export.OneFulfilled(id),
                                new AlertActions.Add.NeutralAlert(
                                    {message: new AlertMessageResource('Job_ProjectExportCard_RunningStatusTitle', {format})}),
                            ];
                        }),
                        catchError(() => of(new ProjectExportAction.Export.OneRejected()))))));
}
