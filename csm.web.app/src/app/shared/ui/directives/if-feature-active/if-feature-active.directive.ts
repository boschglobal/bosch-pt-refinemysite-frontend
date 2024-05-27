/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Directive,
    Input,
    TemplateRef,
    ViewContainerRef,
} from '@angular/core';

import {
    FeatureToggleEnum,
    FeatureToggleEnumKey,
} from '../../../../../configurations/feature-toggles/feature-toggle.enum';
import {FeatureToggleHelper} from '../../../misc/helpers/feature-toggle.helper';

@Directive({
    selector: '[ssIfFeatureActive]',
})
export class IfFeatureActiveDirective {

    @Input()
    public set ssIfFeatureActive(features: FeatureToggleEnumKey[]) {
        this._setVisibility(features);
    }

    private _isShown = false;

    constructor(private _featureToggleHelper: FeatureToggleHelper,
                private _templateRef: TemplateRef<any>,
                private _viewContainer: ViewContainerRef) {
    }

    private _isSomeFeatureActive(features: FeatureToggleEnumKey[]): boolean {
        return features
            .some(feature => this._featureToggleHelper.isFeatureActive(FeatureToggleEnum[feature] as unknown as FeatureToggleEnum));
    }

    private _setVisibility(features: FeatureToggleEnumKey[]): void {
        const canShow = this._isSomeFeatureActive(features);

        if (canShow && !this._isShown) {
            this._viewContainer.createEmbeddedView(this._templateRef);
            this._isShown = true;
        } else if (!canShow && this._isShown) {
            this._viewContainer.clear();
            this._isShown = false;
        }
    }
}
