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

import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {ProjectCraftService} from '../../api/crafts/project-craft.service';
import {ProjectCraftResource} from '../../api/crafts/resources/project-craft.resource';
import {ProjectCraftListResource} from '../../api/crafts/resources/project-craft-list.resource';
import {SaveProjectCraftResource} from '../../api/crafts/resources/save-project-craft.resource';
import {SaveProjectCraftListResource} from '../../api/crafts/resources/save-project-craft-list.resource';
import {ProjectSliceService} from '../projects/project-slice.service';
import {
    ProjectCraftActions,
    ProjectCraftsActionEnum
} from './project-craft.actions';
import {ProjectCraftQueries} from './project-craft.queries';

@Injectable()
export class ProjectCraftEffects {

    constructor(private _actions$: Actions,
                private _craftQueries: ProjectCraftQueries,
                private _projectCraftService: ProjectCraftService,
                private _projectSliceService: ProjectSliceService) {
    }

    public requestAllCrafts$ = createEffect(() => this._actions$
        .pipe(
            ofType(ProjectCraftsActionEnum.RequestAll),
            withLatestFrom(this._projectSliceService.observeCurrentProjectId()),
            mergeMap(([, projectId]) =>
                this._projectCraftService
                    .findAll(projectId)
                    .pipe(
                        map((crafts: ProjectCraftListResource) => new ProjectCraftActions.Request.AllFulfilled(crafts)),
                        catchError(() => of(new ProjectCraftActions.Request.AllRejected()))))));

    public triggerRequestProjectCraftsActions$ = createEffect(() => this._actions$
        .pipe(
            ofType(ProjectCraftsActionEnum.UpdateListRejected),
            switchMap(() => of(new ProjectCraftActions.Request.All()))));

    public create$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(ProjectCraftsActionEnum.CreateOne),
            withLatestFrom(this._projectSliceService.observeCurrentProjectId()),
            withLatestFrom(this._craftQueries.observeListVersion()),
            mergeMap(([[action, projectId], listVersion]: [[ProjectCraftActions.Create.One, string], number]) => {
                const {name, color, position}: SaveProjectCraftResource = action.payload;
                const saveProjectCraftResource: SaveProjectCraftResource = {projectId, name, color, position};

                return this._projectCraftService
                    .create(projectId, saveProjectCraftResource, listVersion)
                    .pipe(
                        map((crafts: ProjectCraftListResource) => new ProjectCraftActions.Create.OneFulfilled(crafts)),
                        catchError(() => of(new ProjectCraftActions.Create.OneRejected())));
            })));

    public update$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(ProjectCraftsActionEnum.UpdateOne),
            withLatestFrom(this._projectSliceService.observeCurrentProjectId()),
            mergeMap(([action, projectId]: ([ProjectCraftActions.Update.One, string])) => {
                const {saveProjectCraft, projectCraftId, craftVersion} = action.payload;
                const {name, color} = saveProjectCraft;
                const saveProjectCraftResource: SaveProjectCraftResource = {projectId, name, color};

                return this._projectCraftService
                    .update(projectId, projectCraftId, saveProjectCraftResource, craftVersion)
                    .pipe(
                        map((craft: ProjectCraftResource) => new ProjectCraftActions.Update.OneFulfilled(craft)),
                        catchError(() => of(new ProjectCraftActions.Update.OneRejected())));
            })));

    public updateList$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(ProjectCraftsActionEnum.UpdateList),
            withLatestFrom(this._craftQueries.observeListVersion()),
            withLatestFrom(this._projectSliceService.observeCurrentProjectId()),
            mergeMap(([[action, listVersion], projectId]: [[ProjectCraftActions.Update.List, number], string]) => {
                const {saveProjectCraft, projectCraftId} = action.payload;
                const updatedSaveProjectCraft: SaveProjectCraftListResource = {
                    projectCraftId,
                    position: saveProjectCraft.position,
                };

                return this._projectCraftService
                    .updateList(projectId, updatedSaveProjectCraft, listVersion - 1)
                    .pipe(
                        map((projectCrafts: ProjectCraftListResource) => new ProjectCraftActions.Update.ListFulfilled(projectCrafts)),
                        catchError(() => of(new ProjectCraftActions.Update.ListRejected())));
            })));

    public createSuccess$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(ProjectCraftsActionEnum.CreateOneFulfilled),
            mergeMap(() => [
                new ProjectCraftActions.Create.OneReset(),
                this._getSuccessAlert('Craft_Create_SuccessMessage'),
            ])));

    public updateSuccess$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(ProjectCraftsActionEnum.UpdateOneFulfilled),
            mergeMap(() => [
                new ProjectCraftActions.Update.OneReset(),
                this._getSuccessAlert('Craft_Update_SuccessMessage'),
            ])));

    /**
     * @description Delete craft interceptor
     * @type {Observable<Action>}
     */
    public delete$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(ProjectCraftsActionEnum.DeleteOne),
            mergeMap((action: ProjectCraftActions.Delete.One) =>
                combineLatest([
                    of(action),
                    this._craftQueries.observeCraftById(action.payload),
                ]).pipe(first())),
            withLatestFrom(this._projectSliceService.observeCurrentProjectId()),
            mergeMap(([[action, currentCraft], projectId]) => {
                const craftId = action.payload;
                const itemVersion: number = currentCraft.version;

                return this._projectCraftService
                    .delete(projectId, craftId, itemVersion)
                    .pipe(
                        map((crafts: ProjectCraftListResource) => new ProjectCraftActions.Delete.OneFulfilled(crafts)),
                        catchError(() => of(new ProjectCraftActions.Delete.OneRejected())),
                    );
            })));

    /**
     * @description Delete craft success interceptor
     * @type {Observable<Action>}
     */
    public deleteSuccess$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(ProjectCraftsActionEnum.DeleteOneFulfilled),
            map(() => this._getSuccessAlert('Craft_Delete_SuccessMessage'))
        ));

    private _getSuccessAlert(key: string): Action {
        return new AlertActions.Add.SuccessAlert({message: {key}});
    }
}
