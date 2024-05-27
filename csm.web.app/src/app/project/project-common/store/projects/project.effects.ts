/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    Actions,
    createEffect,
    ofType
} from '@ngrx/effects';
import {
    Action,
    select,
    Store
} from '@ngrx/store';
import {flatten} from 'lodash';
import {
    Observable,
    ObservableInput,
    of,
    zip,
} from 'rxjs';
import {
    catchError,
    map,
    mergeMap,
    switchMap,
    withLatestFrom
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {ProjectService} from '../../api/projects/project.service';
import {ProjectPictureService} from '../../api/projects/project-picture.service';
import {ProjectResource} from '../../api/projects/resources/project.resource';
import {ProjectListResource} from '../../api/projects/resources/project-list.resource';
import {ProjectPictureResource} from '../../api/projects/resources/project-picture.resource';
import {SaveProjectResource} from '../../api/projects/resources/save-project.resource';
import {SaveProjectPictureResource} from '../../api/projects/resources/save-project-picture.resource';
import {
    DELETE_PROJECT_PICTURE,
    DELETE_PROJECT_PICTURE_FULFILLED,
    POST_PROJECT,
    POST_PROJECT_FULFILLED,
    POST_PROJECT_PICTURE,
    POST_PROJECT_PICTURE_FULFILLED,
    ProjectActions,
    ProjectPictureActions,
    PUT_PROJECT,
    PUT_PROJECT_FULFILLED,
    REQUEST_CURRENT_PROJECT,
    REQUEST_PROJECTS,
    SET_CURRENT_PROJECT
} from './project.actions';
import {ProjectQueries} from './project.queries';

@Injectable()
export class ProjectEffects {

    private _projectQueries: ProjectQueries = new ProjectQueries();

    constructor(private _actions$: Actions,
                private _projectService: ProjectService,
                private _projectPictureService: ProjectPictureService,
                private _store: Store<State>) {
    }

    /**
     * @description Request set current project interceptor
     * @type {Observable<Action>}
     */
    public triggerRequestActions$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(
                SET_CURRENT_PROJECT,
                DELETE_PROJECT_PICTURE_FULFILLED,
                POST_PROJECT_PICTURE_FULFILLED
            ),
            switchMap(() => of(new ProjectActions.Request.CurrentProject()))
        ));

    /**
     * @description Request project interceptor to request current project
     * @type {Observable<Action>}
     */
    public requestAll$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(REQUEST_PROJECTS),
            switchMap(() => {
                const pageNumber = 0;
                const pageSize = 20;

                return this._projectService
                    .findAll(pageNumber, pageSize)
                    .pipe(
                        switchMap((projectList: ProjectListResource) => {
                            const requests = [of(projectList)];

                            for (let page = pageNumber + 1; page < projectList.totalPages; page++) {
                                requests.push(this._projectService.findAll(page, pageSize));
                            }

                            return zip(...requests);
                        }),
                        map((projectLists: ProjectListResource[]) => {
                            const projects = projectLists.map(projectList => projectList.projects);

                            return {
                                ...projectLists[0],
                                projects: flatten(projects),
                            };
                        }),
                        map((projectList: ProjectListResource) => new ProjectActions.Request.ProjectsFulfilled(projectList)),
                        catchError(() => of(new ProjectActions.Request.ProjectsRejected())));
            })));

    /**
     * @description Request project interceptor to request current project
     * @type {Observable<Action>}
     */
    public requestCurrent$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(REQUEST_CURRENT_PROJECT),
            withLatestFrom(this._store
                .pipe(
                    select(this._projectQueries.getCurrentItemId()))),
            mergeMap(([action, currentProjectId]) => this._projectService
                .findOne(currentProjectId)
                .pipe(
                    map(projectResource => new ProjectActions.Request.CurrentProjectFulfilled(projectResource)),
                    catchError(() => of(new ProjectActions.Request.CurrentProjectRejected())))
            )));

    /**
     * @description Request project create and edit success interceptor
     * @type {Observable<Action>}
     */
    public requestSuccess$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(POST_PROJECT_FULFILLED, PUT_PROJECT_FULFILLED, DELETE_PROJECT_PICTURE_FULFILLED, POST_PROJECT_PICTURE_FULFILLED),
            mergeMap((action: Action) => {
                const key: string = action.type === POST_PROJECT_FULFILLED
                    ? 'Project_Create_SuccessMessage' : 'Project_Update_SuccessMessage';

                if (action.type === POST_PROJECT_PICTURE_FULFILLED || action.type === DELETE_PROJECT_PICTURE_FULFILLED) {
                    const projectPictureAction = action.type === POST_PROJECT_PICTURE_FULFILLED
                        ? action as ProjectPictureActions.CreateOrUpdate.ProjectPictureFulfilled
                        : action as ProjectPictureActions.Delete.ProjectPictureFulfilled;

                    return projectPictureAction.isProjectEdited ? [] : [new AlertActions.Add.SuccessAlert({message: {key}})];
                }
                return [new AlertActions.Add.SuccessAlert({message: {key}})];
            })));

    /**
     * @description Create project interceptor
     * @type {Observable<Action>}
     */
    public create$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(POST_PROJECT),
            switchMap((action: Action) => {
                const postProjectAction: ProjectActions.Create.Project = action as ProjectActions.Create.Project;
                return this._projectService
                    .create(this._parseProject(postProjectAction.payload.project))
                    .pipe(
                        mergeMap((project: ProjectResource): ObservableInput<Action> => {
                            const picture: File | string = postProjectAction.payload.picture;

                            if (picture !== null && typeof picture === 'object') {
                                const saveProjectPictureResource: SaveProjectPictureResource
                                    = new SaveProjectPictureResource(project.id, picture);
                                return [
                                    new ProjectActions.Create.ProjectFulfilled(project),
                                    new ProjectPictureActions.CreateOrUpdate.Project(saveProjectPictureResource, true)
                                ];
                            }

                            return [new ProjectActions.Create.ProjectFulfilled(project)];
                        }),
                        catchError(() => of(new ProjectActions.Create.ProjectRejected())));
            })));

    /**
     * @description Update Project Details
     * @type {Observable<Action>}
     */
    public update$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(PUT_PROJECT),
            withLatestFrom(this._store
                .pipe(
                    select(this._projectQueries.getCurrentItem()))),
            mergeMap(([action, currentProject]) => {
                    const updateProjectAction: ProjectActions.Update.Project = action as ProjectActions.Update.Project;
                    const projectId: string = currentProject.id;
                    const version: number = currentProject.version;
                    return this._projectService
                        .update(this._parseProject(updateProjectAction.payload), projectId, version)
                        .pipe(
                            map((project: ProjectResource) => new ProjectActions.Update.ProjectFulfilled(project)),
                            catchError(() => of(new ProjectActions.Update.ProjectRejected())));
                }
            )));

    /**
     * @description Upload picture interceptor
     * @type {Observable<Action>}
     */
    public uploadPicture$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(POST_PROJECT_PICTURE),
            withLatestFrom(this._store
                .pipe(
                    select(this._projectQueries.getCurrentItem()))),
            mergeMap(([action, currentProject]) => {
                    const projectId: string = currentProject.id;
                    const postProjectPictureAction = action as ProjectPictureActions.CreateOrUpdate.Project;
                    const isProjectEdited: boolean = postProjectPictureAction.isProjectEdited;
                    return this._projectPictureService
                        .upload(projectId, postProjectPictureAction.payload.picture)
                        .pipe(
                            map((projectPicture: ProjectPictureResource) =>
                                new ProjectPictureActions.CreateOrUpdate.ProjectPictureFulfilled(projectPicture, isProjectEdited)),
                            catchError(() => of(new ProjectPictureActions.CreateOrUpdate.ProjectPictureRejected())));
                }
            )));

    /**
     * @description Delete project picture
     * @type {Observable<Action>}
     */
    public deletePicture$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(DELETE_PROJECT_PICTURE),
            withLatestFrom(this._store
                .pipe(
                    select(this._projectQueries.getCurrentItem()))),
            mergeMap(([action, currentProject]) => {

                const deleteProjectPictureAction = action as ProjectPictureActions.Delete.ProjectPicture;
                const isProjectEdited: boolean = deleteProjectPictureAction.isProjectEdited;

                return this._projectPictureService
                    .remove(currentProject.id)
                    .pipe(
                        map(() => new ProjectPictureActions.Delete.ProjectPictureFulfilled(currentProject.id, isProjectEdited)),
                        catchError(() => of(new ProjectPictureActions.Delete.ProjectPictureRejected())));
            })));

    private _parseProject(project: SaveProjectResource): SaveProjectResource {
        const formattedValues: any = {
            start: project.start.format('YYYY-MM-DD'),
            end: project.end.format('YYYY-MM-DD'),
            description: project.description === '' ? null : project.description,
            client: project.client === '' ? null : project.client
        };
        return Object.assign({}, project, formattedValues);
    }
}
