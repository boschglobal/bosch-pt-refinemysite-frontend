/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {
    WizardLineColor,
    WizardStepSize
} from './wizard-step.component';

@Component({
    selector: 'ss-wizard-step-test',
    templateUrl: './wizard-step.test.component.html',
})
export class WizardStepTestComponent {
    public label: string;

    public size: WizardStepSize;

    public leftLineColor: WizardLineColor;

    public rightLineColor: WizardLineColor;

    public disabled: boolean;

    public active: boolean;
}
