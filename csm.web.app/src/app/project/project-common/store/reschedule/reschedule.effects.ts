/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
import {of} from 'rxjs';
import {
    catchError,
    mergeMap,
    switchMap,
    withLatestFrom
} from 'rxjs/operators';

import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {AbstractResource} from '../../../../shared/misc/api/resources/abstract.resource';
import {RescheduleService} from '../../api/reschedule/reschedule.service';
import {RescheduleResource} from '../../api/reschedule/resources/reschedule.resource';
import {MilestoneActions} from '../milestones/milestone.actions';
import {ProjectSliceService} from '../projects/project-slice.service';
import {ProjectTaskActions} from '../tasks/task.actions';
import {
    RescheduleActionEnum,
    RescheduleActions
} from './reschedule.actions';

@Injectable()
export class RescheduleEffects {

    constructor(
        private _action$: Actions,
        private _projectSliceService: ProjectSliceService,
        private _rescheduleService: RescheduleService,
    ) {}

    public validate$ = createEffect(() => this._action$.pipe(
        ofType(RescheduleActionEnum.ValidateOne),
        withLatestFrom(this._projectSliceService.observeCurrentProjectId()),
        switchMap(([action, projectId]: [RescheduleActions.Validate.One, string]) =>
            this._rescheduleService.validate(projectId, action.item)
                .pipe(
                    mergeMap((rescheduleResource: RescheduleResource) => {
                        const actions: Action[] = [
                            new RescheduleActions.Validate.OneFulfilled(rescheduleResource),
                        ];
                        if (rescheduleResource.failed.tasks.length > 0) {
                            actions.push(new ProjectTaskActions.Request.AllByIds(rescheduleResource.failed.tasks));
                        }
                        if (rescheduleResource.failed.milestones.length > 0) {
                            actions.push(new MilestoneActions.Request.AllByIds(rescheduleResource.failed.milestones));
                        }
                        return actions;
                    }),
                    catchError(() => of(new RescheduleActions.Validate.OneRejected()))
                ))
    ));

    public reschedule$ = createEffect(() => this._action$.pipe(
        ofType(RescheduleActionEnum.RescheduleOne),
        withLatestFrom(this._projectSliceService.observeCurrentProjectId()),
        switchMap(([action, projectId]: [RescheduleActions.Validate.One, string]) =>
            this._rescheduleService.reschedule(projectId, action.item)
                .pipe(
                    mergeMap(({id}: AbstractResource) => [
                        new RescheduleActions.Reschedule.OneFulfilled(id),
                        new AlertActions.Add.NeutralAlert(
                            {message: new AlertMessageResource('Job_ProjectRescheduleCard_RunningStatusTitle')}),
                    ]),
                    catchError(() => of(new RescheduleActions.Reschedule.OneRejected()))
                ))
    ));
}
