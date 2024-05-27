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
} from 'rxjs/operators';

import {
    FeatureToggleAction,
    FeatureToggleActionsEnum
} from './feature-toggle.actions';
import {FeatureToggleListResource} from '../api/resources/feature-toggle-list.resource';
import {FeatureToggleResource} from '../api/resources/feature-toggle.resource';
import {FeatureToggleService} from '../api/feature-toggle.service';

@Injectable()
export class FeatureToggleEffects {

    constructor(private _actions$: Actions,
                private _featureToggleService: FeatureToggleService) {
    }

    /**
     * @description Set feature toggle interceptor
     * @type {Observable<Action>}
     */
    public addSubjectToFeatureWhitelist$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(FeatureToggleActionsEnum.SetFeatureToggleBySubjectId),
            mergeMap((action: FeatureToggleAction.Set.FeatureToggleBySubjectId) => {
                const {featureName, subjectId, toggleType} = action;
                return this._featureToggleService
                    .addToFeatureWhitelist(subjectId, featureName, toggleType)
                    .pipe(
                        switchMap((feature: FeatureToggleResource) => [
                            new FeatureToggleAction.Set.FeatureToggleBySubjectIdFulfilled(feature),
                            new FeatureToggleAction.Request.FeatureTogglesBySubjectId(subjectId)
                        ]),
                        catchError(() => of(new FeatureToggleAction.Set.FeatureToggleBySubjectIdRejected())));
            })));

    /**
     * @description remove feature toggle from feature whitelist interceptor
     * @type {Observable<Action>}
     */
    public removeSubjectFromFeatureWhitelist$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(FeatureToggleActionsEnum.DeleteFeatureToggleBySubjectId),
            mergeMap((action: FeatureToggleAction.Delete.FeatureToggleBySubjectId) => {
                const {featureName, subjectId} = action;
                return this._featureToggleService
                    .removeFromFeatureWhitelist(subjectId, featureName)
                    .pipe(
                        switchMap(() => [
                                new FeatureToggleAction.Delete.FeatureToggleBySubjectIdFulfilled(),
                                new FeatureToggleAction.Request.FeatureTogglesBySubjectId(subjectId)
                            ]),
                        catchError(() => of(new FeatureToggleAction.Delete.FeatureToggleBySubjectIdRejected())));
            })));

    /**
     * @description Request feature toggles interceptor
     * @type {Observable<Action>}
     */
    public requestFeatureToggles$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(FeatureToggleActionsEnum.RequestFeatureTogglesBySubjectId),
            switchMap((action: FeatureToggleAction.Request.FeatureTogglesBySubjectId) =>
                this._featureToggleService
                    .findAllFeatureTogglesBySubjectId(action.subjectId)
                    .pipe(
                        map((features: FeatureToggleListResource) =>
                            new FeatureToggleAction.Request.FeatureTogglesBySubjectIdFulfilled(features)),
                        catchError(() => of(new FeatureToggleAction.Request.FeatureTogglesBySubjectIdRejected())))
            )));
}
