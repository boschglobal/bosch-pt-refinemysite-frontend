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

import {State} from '../../../../app.reducers';
import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {SaveWorkareaResource} from '../../api/workareas/resources/save-workarea.resource';
import {SaveWorkareaListResource} from '../../api/workareas/resources/save-workarea-list.resource';
import {WorkareaResource} from '../../api/workareas/resources/workarea.resource';
import {WorkareaListResource} from '../../api/workareas/resources/workarea-list.resource';
import {WorkareaService} from '../../api/workareas/workarea.service';
import {ProjectQueries} from '../projects/project.queries';
import {
    WorkareaActionEnum,
    WorkareaActions
} from './workarea.actions';
import {WorkareaQueries} from './workarea.queries';

@Injectable()
export class WorkareaEffects {

    private _projectQueries: ProjectQueries = new ProjectQueries();

    constructor(private _actions$: Actions,
                private _store: Store<State>,
                private _workareaQueries: WorkareaQueries,
                private _workareaService: WorkareaService) {
    }

    public requestAllWorkareas$ = createEffect(() => this._actions$
        .pipe(
            ofType(WorkareaActionEnum.RequestAll),
            withLatestFrom(this._store
                .pipe(
                    select(this._projectQueries.getSlice()))),
            mergeMap(([action, projectSlice]) => {
                const projectId = projectSlice.currentItem.id;

                return this._workareaService
                    .findAll(projectId)
                    .pipe(
                        map((workareas: WorkareaListResource) => new WorkareaActions.Request.AllFulfilled(workareas)),
                        catchError(_ => of(new WorkareaActions.Request.AllRejected())));
            })));

    public triggerRequestWorkareasActions$ = createEffect(() => this._actions$
        .pipe(
            ofType(WorkareaActionEnum.UpdateListRejected),
            switchMap(() => of(new WorkareaActions.Request.All()))));

    public create$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(WorkareaActionEnum.CreateOne),
            withLatestFrom(this._store
                .pipe(
                    select(this._projectQueries.getSlice()))),
            withLatestFrom(this._store
                .pipe(
                    select(this._workareaQueries.getSlice()))),
            mergeMap(([[action, projectSlice], workareaSlice]) => {
                const createWorkareaAction: WorkareaActions.Create.One = action as WorkareaActions.Create.One;
                const projectId = projectSlice.currentItem.id;
                const saveWorkarea: SaveWorkareaResource = Object.assign({}, createWorkareaAction.payload, {projectId});
                const listVersion: number = workareaSlice.list.version;

                return this._workareaService
                    .create(saveWorkarea, listVersion)
                    .pipe(
                        map((workareas: WorkareaListResource) => new WorkareaActions.Create.OneFulfilled(workareas)),
                        catchError(_ => of(new WorkareaActions.Create.OneRejected())));
            })));

    public update$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(WorkareaActionEnum.UpdateOne),
            withLatestFrom(this._store
                .pipe(
                    select(this._projectQueries.getSlice()))),
            mergeMap(([action]) => {
                const updateWorkareaAction: WorkareaActions.Update.One = action as WorkareaActions.Update.One;
                const {saveWorkarea, workareaId} = updateWorkareaAction.payload;
                const updatedSaveWorkarea: SaveWorkareaResource = Object.assign({}, saveWorkarea);

                return this._workareaService
                    .update(workareaId, updatedSaveWorkarea)
                    .pipe(
                        map((workarea: WorkareaResource) => new WorkareaActions.Update.OneFulfilled(workarea)),
                        catchError(_ => of(new WorkareaActions.Update.OneRejected())));
            })));

    public updateList$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(WorkareaActionEnum.UpdateList),
            withLatestFrom(this._store
                .pipe(
                    select(this._workareaQueries.getSlice()))),
            mergeMap(([action, workareaSlice]) => {
                const updateWorkareaAction: WorkareaActions.Update.List = action as WorkareaActions.Update.List;
                const {saveWorkarea, workareaId} = updateWorkareaAction.payload;
                const updatedSaveWorkarea: SaveWorkareaListResource = {
                    workAreaId: workareaId,
                    position: saveWorkarea.position,
                };

                const listVersion: number = workareaSlice.list.version - 1;

                return this._workareaService
                    .updateList(updatedSaveWorkarea, listVersion)
                    .pipe(
                        map((workareas: WorkareaListResource) => new WorkareaActions.Update.ListFulfilled(workareas)),
                        catchError(_ => of(new WorkareaActions.Update.ListRejected())));
            })));

    public createOrUpdateSuccess$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(WorkareaActionEnum.CreateOneFulfilled, WorkareaActionEnum.UpdateOneFulfilled),
            mergeMap((action: Action) => {
                const key = action.type === WorkareaActionEnum.CreateOneFulfilled
                    ? 'Workarea_Create_SuccessMessage'
                    : 'Workarea_Update_SuccessMessage';

                return [
                    new WorkareaActions.Update.OneReset(),
                    new AlertActions.Add.SuccessAlert({message: {key}})
                ];
            })));

    /**
     * @description Delete workarea interceptor
     * @type {Observable<Action>}
     */
    public delete$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(WorkareaActionEnum.DeleteOne),
            mergeMap((action: WorkareaActions.Delete.One) => {
                return combineLatest([
                    of(action),
                    this._workareaQueries.observeWorkareaById(action.payload),
                ]).pipe(first());
            }),
            mergeMap(([action, currentWorkarea]) => {
                const workareaId = action.payload;
                const itemVersion: number = currentWorkarea.version;

                return this._workareaService
                    .delete(workareaId, itemVersion)
                    .pipe(
                        map((workareas: WorkareaListResource) => new WorkareaActions.Delete.OneFulfilled(workareas)),
                        catchError(() => of(new WorkareaActions.Delete.OneRejected())),
                    );
            })));

    /**
     * @description Delete workarea success interceptor
     * @type {Observable<Action>}
     */
    public deleteSuccess$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(WorkareaActionEnum.DeleteOneFulfilled),
            map(() => new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Workarea_Delete_SuccessMessage')}))));
}
