/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
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
    combineLatest,
    Observable,
    of
} from 'rxjs';
import {
    catchError,
    first,
    map,
    mergeMap,
    switchMap,
    withLatestFrom
} from 'rxjs/operators';

import {TaskConstraintsResource} from '../../api/task-constraints/resources/task-constraints.resource';
import {TaskConstraintsService} from '../../api/task-constraints/task-constraints.service';
import {ProjectSliceService} from '../projects/project-slice.service';
import {
    TaskConstraintsActionEnum,
    TaskConstraintsActions
} from './task-constraints.actions';
import {TaskConstraintsQueries} from './task-constraints.queries';

@Injectable()
export class TaskConstraintsEffects {
    constructor(private _actions$: Actions,
                private _projectSliceService: ProjectSliceService,
                private _taskConstraintsQueries: TaskConstraintsQueries,
                private _taskConstraintsService: TaskConstraintsService) {
    }

    /**
     * @description Request Task Constraints interceptor
     * @returns {Observable<Action>}
     */
    public requestOne$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TaskConstraintsActionEnum.RequestOne),
            withLatestFrom(
                this._projectSliceService.observeCurrentProjectId(),
            ),
            switchMap(([action, projectId]: [TaskConstraintsActions.Request.One, string]) =>
                this._taskConstraintsService.findOne(projectId, action.taskId)
                    .pipe(
                        map((taskConstraints: TaskConstraintsResource) =>
                            new TaskConstraintsActions.Request.OneFulfilled(action.taskId, taskConstraints)),
                        catchError(() => of(new TaskConstraintsActions.Request.OneRejected(action.taskId)))))));

    /**
     * @description Update Task Constraints interceptor
     * @returns {Observable<Action>}
     */
    public updateOne$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TaskConstraintsActionEnum.UpdateOne),
            mergeMap((action: TaskConstraintsActions.Update.One) =>
                combineLatest([
                    of(action),
                    this._projectSliceService.observeCurrentProjectId(),
                    this._taskConstraintsQueries.observeTaskConstraintsVersionByTaskId(action.taskId),
                ]).pipe(first())
            ),
            switchMap(([action, projectId, version]: [TaskConstraintsActions.Update.One, string, number]) =>
                this._taskConstraintsService.updateOne(projectId, action.taskId, action.payload, version)
                    .pipe(
                        map((taskConstraints: TaskConstraintsResource) =>
                            new TaskConstraintsActions.Update.OneFulfilled(action.taskId, taskConstraints)),
                        catchError(() => of(new TaskConstraintsActions.Update.OneRejected(action.taskId)))))));
}
