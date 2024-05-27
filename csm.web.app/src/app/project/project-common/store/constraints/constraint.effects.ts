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
    of
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
import {ConstraintService} from '../../api/constraints/constraint.service';
import {ConstraintEntity} from '../../entities/constraints/constraint';
import {ProjectSliceService} from '../projects/project-slice.service';
import {
    ConstraintActionEnum,
    ConstraintActions
} from './constraint.actions';

const UPDATE_ACTIONS_MAP: Map<ConstraintActionEnum, Object> = Object.assign({}, new Map(), {
    [ConstraintActionEnum.UpdateOne]: {
        successMessageKey: 'Constraint_Updated_SuccessMessage',
        fulfilledAction: ConstraintActions.Update.OneFulfilled,
        rejectedAction: ConstraintActions.Update.OneRejected,
    },
    [ConstraintActionEnum.ActivateOne]: {
        successMessageKey: 'Constraint_Activated_SuccessMessage',
        fulfilledAction: ConstraintActions.Activate.OneFulfilled,
        rejectedAction: ConstraintActions.Activate.OneRejected,
    },
    [ConstraintActionEnum.DeactivateOne]: {
        successMessageKey: 'Constraint_Deactivated_SuccessMessage',
        fulfilledAction: ConstraintActions.Deactivate.OneFulfilled,
        rejectedAction: ConstraintActions.Deactivate.OneRejected,
    },
});

const TRIGGER_REQUEST_UPDATE_ACTIONS: string[] = [
    ConstraintActionEnum.UpdateOne,
    ConstraintActionEnum.ActivateOne,
    ConstraintActionEnum.DeactivateOne,
];

@Injectable()
export class ConstraintEffects {
    constructor(private _actions$: Actions,
                private _constraintService: ConstraintService,
                private _projectSliceService: ProjectSliceService) {
    }

    /**
     * @description Request all Constraints interceptor
     * @type {Observable<Action>}
     */
    public requestAll$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(ConstraintActionEnum.RequestAll),
            withLatestFrom(
                this._projectSliceService.observeCurrentProjectId(),
            ),
            switchMap(([action, projectId]) =>
                this._constraintService.findAll(projectId)
                    .pipe(
                        map((constraintList: ConstraintEntity[]) => new ConstraintActions.Request.AllFulfilled(constraintList)),
                        catchError(() => of(new ConstraintActions.Request.AllRejected()))))));

    /**
     * @description Update Constraint interceptor
     * @type {Observable<Action>}
     */
    public update$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(...TRIGGER_REQUEST_UPDATE_ACTIONS),
            withLatestFrom(
                this._projectSliceService.observeCurrentProjectId(),
            ),
            mergeMap(([{
                item,
                type,
            }, projectId]: [ConstraintActions.Update.One | ConstraintActions.Activate.One | ConstraintActions.Deactivate.One, string]) =>
                this._constraintService.update(projectId, item)
                    .pipe(
                        mergeMap((constraintEntity: ConstraintEntity) => {
                            const {fulfilledAction, successMessageKey} = UPDATE_ACTIONS_MAP[type];

                            return [
                                new fulfilledAction(constraintEntity),
                                new AlertActions.Add.SuccessAlert({message: new AlertMessageResource(successMessageKey)}),
                            ];
                        }),
                        catchError(() => {
                            const {rejectedAction} = UPDATE_ACTIONS_MAP[type];
                            const actionPayload = item.key;

                            return of(new rejectedAction(actionPayload));
                        })))));
}
