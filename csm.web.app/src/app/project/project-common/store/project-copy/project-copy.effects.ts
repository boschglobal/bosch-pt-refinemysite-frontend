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
import {Action} from '@ngrx/store';
import {
    Observable,
    of
} from 'rxjs';
import {
    catchError,
    mergeMap,
    switchMap
} from 'rxjs/operators';

import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {ProjectCopyService} from '../../api/project-copy/project-copy.service';
import {
    ProjectCopyAction,
    ProjectCopyActionEnum
} from './project-copy.actions';

@Injectable()
export class ProjectCopyEffects {

    constructor(private _actions$: Actions,
                private _projectCopyService: ProjectCopyService) {
    }

    /**
     * @description Copy project interceptor
     * @type {Observable<Action>}
     */
    public copyProject$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(ProjectCopyActionEnum.CopyOne),
            switchMap( ({projectId, projectCopy}: ProjectCopyAction.Copy.One) =>
                this._projectCopyService.copyOne(projectId, projectCopy)
                    .pipe(
                        mergeMap(({id}) => [
                            new ProjectCopyAction.Copy.OneFulfilled(id),
                            new AlertActions.Add.NeutralAlert(
                                {message: new AlertMessageResource('Job_ProjectCopyCard_RunningStatusTitle')}),
                        ]),
                        catchError(() => of(new ProjectCopyAction.Copy.OneRejected()))))));
}
