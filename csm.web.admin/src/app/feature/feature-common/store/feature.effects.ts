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
    debounceTime,
    map,
    mergeMap,
    switchMap,
} from 'rxjs/operators';

import {
    FeatureAction,
    FeatureActionsEnum
} from './feature.actions';
import {FeatureListResource} from '../api/resources/feature-list.resource';
import {FeatureResource} from '../api/resources/feature.resource';
import {FeatureService} from '../api/feature.service';
import {REQUEST_DEBOUNCE_TIME} from '../../../shared/misc/constants/general.constants';

const TRIGGER_REQUEST_FEATURE_ACTIONS: string[] = [
    FeatureActionsEnum.CreateFeatureFulfilled,
];

@Injectable()
export class FeatureEffects {

    constructor(private _actions$: Actions,
                private _featureService: FeatureService) {
    }

    /**
     * @description Create feature
     * @type {Observable<Action>}
     */
    public createFeature$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(FeatureActionsEnum.CreateFeature),
            mergeMap((action: FeatureAction.Create.Feature) => {
                const {featureName} = action;
                return this._featureService
                    .createFeature(featureName)
                    .pipe(
                        map((feature: FeatureResource) => new FeatureAction.Create.FeatureFulfilled(feature)),
                        catchError(() => of(new FeatureAction.Create.FeatureRejected())));
            })));

    /**
     * @description Set feature enable
     * @type {Observable<Action>}
     */
    public setFeatureEnable$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(FeatureActionsEnum.SetFeatureEnable),
            mergeMap((action: FeatureAction.Set.FeatureEnable) => {
                const {featureName} = action;
                return this._featureService
                    .enableFeature(featureName)
                    .pipe(
                        map((feature: FeatureResource) => new FeatureAction.Set.FeatureEnableFulfilled(feature)),
                        catchError(() => of(new FeatureAction.Set.FeatureEnableRejected())));
            })));

    /**
     * @description Set feature disable
     * @type {Observable<Action>}
     */
    public setFeatureDisable$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(FeatureActionsEnum.SetFeatureDisable),
            mergeMap((action: FeatureAction.Set.FeatureDisable) => {
                const {featureName} = action;
                return this._featureService
                    .disableFeature(featureName)
                    .pipe(
                        map((feature: FeatureResource) => new FeatureAction.Set.FeatureDisableFulfilled(feature)),
                        catchError(() => of(new FeatureAction.Set.FeatureDisableRejected())));
            })));

    /**
     * @description Set feature whitelist active
     * @type {Observable<Action>}
     */
    public setFeatureWhitelistActive$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(FeatureActionsEnum.SetFeatureWhitelistActive),
            mergeMap((action: FeatureAction.Set.FeatureWhitelistActive) => {
                const {featureName} = action;
                return this._featureService
                    .activateFeatureWhitelist(featureName)
                    .pipe(
                        map((feature: FeatureResource) => new FeatureAction.Set.FeatureWhitelistActiveFulfilled(feature)),
                        catchError(() => of(new FeatureAction.Set.FeatureWhitelistActiveRejected())));
            })));

    /**
     * @description Request features interceptor
     * @type {Observable<Action>}
     */
    public requestFeatures$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(FeatureActionsEnum.RequestFeatures),
            switchMap((action: FeatureAction.Request.Features) =>
                this._featureService
                    .findAllFeatures()
                    .pipe(
                        map((features: FeatureListResource) =>
                            new FeatureAction.Request.FeaturesFulfilled(features)),
                        catchError(() => of(new FeatureAction.Request.FeaturesRejected())))
            )));

    public triggerRequestFeaturesActions$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(...TRIGGER_REQUEST_FEATURE_ACTIONS),
            debounceTime(REQUEST_DEBOUNCE_TIME),
            switchMap(() => of(new FeatureAction.Request.Features()))));
}
