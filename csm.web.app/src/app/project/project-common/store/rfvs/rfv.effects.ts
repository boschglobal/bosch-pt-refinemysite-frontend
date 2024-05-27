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
    Observable,
    of,
} from 'rxjs';
import {
    catchError,
    map,
    mergeMap,
    switchMap,
    withLatestFrom
} from 'rxjs/operators';

import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {RfvService} from '../../api/rfvs/rfv.service';
import {RfvEntity} from '../../entities/rfvs/rfv';
import {ProjectSliceService} from '../projects/project-slice.service';
import {
    RfvActions,
    RfvActionsEnum
} from './rfv.actions';

const UPDATE_ACTIONS_MAP: Map<RfvActionsEnum, Object> = Object.assign({}, new Map(), {
    [RfvActionsEnum.UpdateOne]: {
        successMessageKey: 'Rfv_Updated_SuccessMessage',
        fulfilledAction: RfvActions.Update.OneFulfilled,
        rejectedAction: RfvActions.Update.OneRejected,
    },
    [RfvActionsEnum.ActivateOne]: {
        successMessageKey: 'Rfv_Activated_SuccessMessage',
        fulfilledAction: RfvActions.Activate.OneFulfilled,
        rejectedAction: RfvActions.Activate.OneRejected,
    },
    [RfvActionsEnum.DeactivateOne]: {
        successMessageKey: 'Rfv_Deactivated_SuccessMessage',
        fulfilledAction: RfvActions.Deactivate.OneFulfilled,
        rejectedAction: RfvActions.Deactivate.OneRejected,
    },
});

const TRIGGER_REQUEST_UPDATE_ACTIONS: string[] = [
    RfvActionsEnum.UpdateOne,
    RfvActionsEnum.ActivateOne,
    RfvActionsEnum.DeactivateOne,
];

@Injectable()
export class RfvEffects {
    constructor(private _actions$: Actions,
                private _projectSliceService: ProjectSliceService,
                private _rfvService: RfvService) {
    }

    /**
     * @description Request all RFVs interceptor
     * @type {Observable<Action>}
     */
    public requestAll$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(RfvActionsEnum.RequestAll),
            withLatestFrom(
                this._projectSliceService.observeCurrentProjectId(),
            ),
            switchMap(([action, projectId]) =>
                this._rfvService.findAll(projectId)
                    .pipe(
                        map((rfvEntityList: RfvEntity[]) => new RfvActions.Request.AllFulfilled(rfvEntityList)),
                        catchError(() => of(new RfvActions.Request.AllRejected()))))));

    /**
     * @description Update RFV interceptor
     * @type {Observable<Action>}
     */
    public update$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(...TRIGGER_REQUEST_UPDATE_ACTIONS),
            withLatestFrom(
                this._projectSliceService.observeCurrentProjectId(),
            ),
            mergeMap(([action, projectId]) =>
                this._rfvService
                    .update(projectId, (action as RfvActions.Update.One | RfvActions.Activate.One | RfvActions.Deactivate.One).item)
                    .pipe(
                        mergeMap((rfvEntity: RfvEntity) => {
                            const {fulfilledAction, successMessageKey} = UPDATE_ACTIONS_MAP[action.type];

                            return [
                                new fulfilledAction(rfvEntity),
                                new AlertActions.Add.SuccessAlert({message: new AlertMessageResource(successMessageKey)}),
                            ];
                        }),
                        catchError(() => {
                            const {rejectedAction} = UPDATE_ACTIONS_MAP[action.type];
                            const actionPayload =
                                (action as RfvActions.Update.One | RfvActions.Activate.One | RfvActions.Deactivate.One).item.key;

                            return of(new rejectedAction(actionPayload));
                        })))));
}
