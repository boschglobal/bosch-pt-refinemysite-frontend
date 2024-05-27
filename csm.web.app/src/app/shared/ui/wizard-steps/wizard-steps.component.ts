/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output
} from '@angular/core';

import {
    WizardLineColor,
    WizardStepSize,
} from './wizard-step/wizard-step.component';

@Component({
    selector: 'ss-wizard-steps',
    templateUrl: './wizard-steps.component.html',
    styleUrls: ['./wizard-steps.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class WizardStepsComponent implements OnInit {
    @Input()
    public wizardSteps: WizardStep[];

    @Input()
    public wizardStepSize: WizardStepSize = WizardStepSize.Large;

    @Output()
    public wizardStepsChange: EventEmitter<WizardStep[]> = new EventEmitter<WizardStep[]>();

    public currentStepIndex = 0;

    ngOnInit() {
        this.currentStepIndex = this.wizardSteps.findIndex(step => step.active);
    }

    public advanceStep(): void {
        const nextStep = this.wizardSteps[this.currentStepIndex + 1];

        if (this.currentStepIndex + 1 < this.wizardSteps.length && !nextStep.disabled) {
            this.wizardSteps[this.currentStepIndex].active = false;
            this.wizardSteps[this.currentStepIndex + 1].active = true;
            this.currentStepIndex++;

            this.wizardStepsChange.emit(this.wizardSteps);
        }
    }

    public regressStep(): void {
        if (this.currentStepIndex > 0) {
            this.wizardSteps[this.currentStepIndex].active = false;
            this.wizardSteps[this.currentStepIndex - 1].active = true;
            this.currentStepIndex--;

            this.wizardStepsChange.emit(this.wizardSteps);
        }
    }

    public handleNavigation(stepIndex: number): void {
        if (!this.wizardSteps[stepIndex].disabled) {
            this.wizardSteps[this.currentStepIndex].active = false;
            this.wizardSteps[stepIndex].active = true;

            this.currentStepIndex = stepIndex;
            this.wizardStepsChange.emit(this.wizardSteps);
        }
    }

    private _isStepAvailable(stepIndex: number): boolean {
        return !this.wizardSteps[stepIndex].disabled;
    }

    public getLeftLineColor(index: number): WizardLineColor {
        if (index === 0) {
            return null;
        }

        return this._isStepAvailable(index) ? WizardLineColor.Blue : WizardLineColor.Grey;
    }

    public getRightLineColor(index: number): WizardLineColor {
        if (this.wizardSteps[index + 1]) {
            return this._isStepAvailable(index + 1) ? WizardLineColor.Blue : WizardLineColor.Grey;
        } else {
            return null;
        }
    }
}

export interface WizardStep {
    label?: string;
    icon?: string;
    active: boolean;
    disabled: boolean;
}
