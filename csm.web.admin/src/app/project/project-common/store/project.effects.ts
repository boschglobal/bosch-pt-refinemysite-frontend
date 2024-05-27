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
    ofType,
} from '@ngrx/effects';
import {
    Action,
    select,
    Store,
} from '@ngrx/store';
import {
    Observable,
    of,
} from 'rxjs';
import {
    catchError,
    debounceTime,
    map,
    switchMap,
    withLatestFrom,
} from 'rxjs/operators';

import {REQUEST_DEBOUNCE_TIME} from '../../../shared/misc/constants/general.constants';
import {State} from '../../../app.reducers';
import {ProjectService} from '../api/project.service';
import {ProjectListResource} from '../api/resources/project-list.resource';
import {ProjectResource} from '../api/resources/project.resource';
import {
    ProjectActions,
    ProjectActionsEnum,
} from './project.actions';
import {ProjectQueries} from './project.queries';

const TRIGGER_REQUEST_PROJECTS_ACTIONS: string[] = [
    ProjectActionsEnum.DeleteOneFulfilled,
    ProjectActionsEnum.SetFilters,
    ProjectActionsEnum.SetPage,
    ProjectActionsEnum.SetPageSize,
    ProjectActionsEnum.SetSort,
];

@Injectable()
export class ProjectEffects {

    private _projectQueries: ProjectQueries = new ProjectQueries(this._store);

    constructor(private _actions$: Actions,
                private _projectService: ProjectService,
                private _store: Store<State>) {
    }

    /**
     * @description Global interceptor for project requests
     * @type {Observable<Action>}
     */
    public triggerRequestProjectsActions$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(...TRIGGER_REQUEST_PROJECTS_ACTIONS),
            debounceTime(REQUEST_DEBOUNCE_TIME),
            switchMap(() => of(new ProjectActions.Request.Page()))));

    /**
     * @description Request one project interceptor
     * @type {Observable<Action>}
     */
    public requestOne$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(ProjectActionsEnum.RequestOne),
            switchMap((action: ProjectActions.Request.One) =>
                this._projectService
                    .findOne(action.id)
                    .pipe(
                        map((project: ProjectResource) => new ProjectActions.Request.OneFulfilled(project)),
                        catchError(() => of(new ProjectActions.Request.OneRejected())))
            )));

    /**
     * @description Request project page interceptor
     * @type {Observable<Action>}
     */
    public requestPage$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(ProjectActionsEnum.RequestPage),
            withLatestFrom(this._store
                .pipe(
                    select(this._projectQueries.getSlice()))),
            switchMap(([, projectSlice]) => {
                const {sort, filters, pagination: {pageNumber, pageSize}} = projectSlice.list;

                return this._projectService
                    .findAll(pageNumber, pageSize, sort, filters)
                    .pipe(
                        map((projects: ProjectListResource) => new ProjectActions.Request.PageFulfilled(projects)),
                        catchError(() => of(new ProjectActions.Request.PageRejected())));
            })));

    /**
     * @description Delete project interceptor
     * @type {Observable<Action>}
     */
    public delete$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(ProjectActionsEnum.DeleteOne),
            switchMap((action: ProjectActions.Delete.One) => {
                const {id, projectDeleteResource} = action;

                return this._projectService
                    .delete(id, projectDeleteResource)
                    .pipe(
                        map(() => new ProjectActions.Delete.OneFulfilled(id)),
                        catchError(() => of(new ProjectActions.Delete.OneRejected())));
            })));
}
