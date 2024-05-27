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
    map,
    mergeMap,
    switchMap,
    tap,
    withLatestFrom
} from 'rxjs/operators';

import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {WorkDaysResource} from '../../api/work-days/resources/work-days.resource';
import {WorkDaysService} from '../../api/work-days/work-days.service';
import {ProjectDateLocaleHelper} from '../../helpers/project-date-locale.helper.service';
import {ProjectSliceService} from '../projects/project-slice.service';
import {
    WorkDaysActionEnum,
    WorkDaysActions
} from './work-days.actions';

@Injectable()
export class WorkDaysEffects {

    constructor(private _actions$: Actions,
                private _projectDateHelper: ProjectDateLocaleHelper,
                private _projectSliceService: ProjectSliceService,
                private _workDaysService: WorkDaysService) {
    }

    public requestOne$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(WorkDaysActionEnum.RequestOne),
            withLatestFrom(
                this._projectSliceService.observeCurrentProjectId(),
            ),
            switchMap(([, projectId]: [WorkDaysActions.Request.One, string]) =>
                this._workDaysService.findAll(projectId)
                    .pipe(
                        tap((workDays: WorkDaysResource) =>
                            this._projectDateHelper.configProjectMomentLocaleFirstDayOfWeek(workDays.startOfWeek)),
                        map((workDays: WorkDaysResource) => new WorkDaysActions.Request.OneFulfilled(workDays)),
                        catchError(() => of(new WorkDaysActions.Request.OneRejected()))))));

    public updateOne$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(WorkDaysActionEnum.UpdateOne),
            withLatestFrom(
                this._projectSliceService.observeCurrentProjectId(),
            ),
            switchMap(([{payload, version}, projectId]: [WorkDaysActions.Update.One, string]) =>
                this._workDaysService.update(projectId, payload, version)
                    .pipe(
                        tap((workDays: WorkDaysResource) =>
                            this._projectDateHelper.configProjectMomentLocaleFirstDayOfWeek(workDays.startOfWeek)),
                        mergeMap((workDays: WorkDaysResource) => [
                            new WorkDaysActions.Update.OneFulfilled(workDays),
                            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('WorkingDays_Update_SuccessMessage')}),
                        ]),
                        catchError(() => of(new WorkDaysActions.Update.OneRejected()))))));
}
