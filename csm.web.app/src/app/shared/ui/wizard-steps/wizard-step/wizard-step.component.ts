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
    Input,
} from '@angular/core';

export const CSS_CLASS_WIZARD_STEP_ACTIVE = 'ss-wizard-step__dot--active';
export const CSS_CLASS_WIZARD_STEP_DISABLED = 'ss-wizard-step__dot--disabled';
export const CSS_CLASS_WIZARD_STEP_HIDE_LINE = 'ss-wizard-step__line--hide';
export const CSS_CLASS_WIZARD_STEP_SIZE_SMALL = 'ss-wizard-step__line--small';

@Component({
    selector: 'ss-wizard-step',
    templateUrl: './wizard-step.component.html',
    styleUrls: ['./wizard-step.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WizardStepComponent{
    @Input()
    public label?: string;

    @Input()
    public size: WizardStepSize;

    @Input()
    public rightLineColor: WizardLineColor = WizardLineColor.Grey;

    @Input()
    public leftLineColor: WizardLineColor = WizardLineColor.Grey;

    @Input()
    public active = true;

    @Input()
    public disabled = false;

    public getLeftLineClasses(): Object {
        return {
            [this.leftLineColor]: !!this.leftLineColor,
            [CSS_CLASS_WIZARD_STEP_SIZE_SMALL]: this.size === WizardStepSize.Small,
            [CSS_CLASS_WIZARD_STEP_HIDE_LINE]: !this.leftLineColor,
        };
    }

    public getRightLineClasses(): Object {
        return {
            [this.rightLineColor]: !!this.rightLineColor,
            [CSS_CLASS_WIZARD_STEP_SIZE_SMALL]: this.size === WizardStepSize.Small,
            [CSS_CLASS_WIZARD_STEP_HIDE_LINE]: !this.rightLineColor,
        };
    }

    public getDotClasses(): Object {
        return {
            [CSS_CLASS_WIZARD_STEP_ACTIVE]: this.active,
            [CSS_CLASS_WIZARD_STEP_DISABLED]: this.disabled,
        };
    }
}

export enum WizardStepSize {
    Large = 'LARGE',
    Small = 'SMALL',
}

export enum WizardLineColor {
    Blue = 'ss-wizard-step__line--blue',
    Grey = 'ss-wizard-step__line--grey',
}
