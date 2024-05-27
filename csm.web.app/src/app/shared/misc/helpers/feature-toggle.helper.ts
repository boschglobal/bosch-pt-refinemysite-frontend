/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';

import {FeatureToggleEnum} from '../../../../configurations/feature-toggles/feature-toggle.enum';
import {EnvironmentHelper} from './environment.helper';

@Injectable({
    providedIn: 'root',
})
export class FeatureToggleHelper {

    private _features: FeatureToggleEnum[] = [];

    constructor(private _environmentHelper: EnvironmentHelper) {
        this._features = this._environmentHelper.getConfiguration().features;
    }

    public isFeatureActive(feature: FeatureToggleEnum): boolean {
        return this._features.includes(feature);
    }
}

