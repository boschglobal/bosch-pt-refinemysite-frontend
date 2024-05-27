/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
} from '@angular/core';

import {FeatureToggleEnumKey} from '../../../../../configurations/feature-toggles/feature-toggle.enum';

@Component({
    template: `
        <div *ssIfFeatureActive="features"
             [attr.data-automation]="'feature-toggle'"></div>`,
})
export class IfFeatureActiveTestComponent {

    @Input()
    public features: FeatureToggleEnumKey[];
}
