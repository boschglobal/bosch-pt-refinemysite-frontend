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
    switchMap
} from 'rxjs/operators';

import {PATService} from '../../../project/project-common/api/pats/pat.service';
import {PATResource} from '../../../project/project-common/api/pats/resources/pat.resource';
import {PATListResource} from '../../../project/project-common/api/pats/resources/pat-list.resource';
import {AlertActions} from '../../../shared/alert/store/alert.actions';
import {
    PATActionEnum,
    PATActions
} from './pat.actions';
import {PATQueries} from './pat.queries';

@Injectable()
export class PATEffects {

    constructor(private _actions$: Actions,
                private _patQueries: PATQueries,
                private _patService: PATService) {
    }

    public requestAll$ = createEffect(() => this._actions$
        .pipe(
            ofType(PATActionEnum.RequestAll),
            switchMap(() =>
                this._patService.findAll().pipe(
                    map((pats: PATListResource) => new PATActions.Request.AllFulfilled(pats)),
                    catchError(() => of(new PATActions.Request.AllRejected()))))));

    public createOne$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(PATActionEnum.CreateOne),
            switchMap((action: PATActions.Create.One) => {
                return this._patService
                    .create(action.payload)
                    .pipe(
                        map((pat: PATResource) => new PATActions.Create.OneFulfilled(pat)),
                        catchError(() => of(new PATActions.Create.OneRejected())));
            })));

    public updateOne$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(PATActionEnum.UpdateOne),
            switchMap((action: PATActions.Update.One) => {
                const {patId, savePATResource, version} = action.payload;

                return this._patService
                    .update(patId, savePATResource, version)
                    .pipe(
                        map((pat: PATResource) => new PATActions.Update.OneFulfilled(pat)),
                        catchError(() => of(new PATActions.Update.OneRejected())));
            })));

    public deleteOne$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(PATActionEnum.DeleteOne),
            mergeMap((action: PATActions.Delete.One) =>
                combineLatest([
                    of(action),
                    this._patQueries.observePATById(action.payload),
                ]).pipe(first())),
            switchMap(([action, currentPAT]) => {
                const patId = action.payload;
                const {version} = currentPAT;

                return this._patService
                    .delete(patId, version)
                    .pipe(
                        map(() => new PATActions.Delete.OneFulfilled(patId)),
                        catchError(() => of(new PATActions.Delete.OneRejected())));
            })));

    public createOneSuccess$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(PATActionEnum.CreateOneFulfilled),
            map(() => this._getSuccessAlert('PAT_Create_SuccessMessage'))));

    public updateOneSuccess$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(PATActionEnum.UpdateOneFulfilled),
            map(() => this._getSuccessAlert('PAT_Update_SuccessMessage'))));

    public deleteOneSuccess$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(PATActionEnum.DeleteOneFulfilled),
            map(() => this._getSuccessAlert('PAT_Delete_SuccessMessage'))
        ));

    private _getSuccessAlert(key: string): Action {
        return new AlertActions.Add.SuccessAlert({message: {key}});
    }
}
