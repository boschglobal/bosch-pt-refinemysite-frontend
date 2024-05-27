/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup
} from '@angular/forms';

export const SWITCH_BUTTON_DEFAULT_STATE: any = {
    value: null,
    automationAttr: 'switch',
    name: 'switch',
    icon: 'icon-test',
    validators: [],
    isDisabled: false,
    isRequired: false,
    controlName: 'switch'
};

@Component({
    templateUrl: './switch-button.test.component.html'
})
export class SwitchButtonTestComponent {
    public formGroup: UntypedFormGroup;

    public defaultInputState: any = {
        switch: SWITCH_BUTTON_DEFAULT_STATE,
    };

    constructor(private _formBuilder: UntypedFormBuilder) {
    }

    public setForm(): void {
        this.formGroup = this._formBuilder.group({
            [this.defaultInputState.switch.controlName]: [this.defaultInputState.switch.value, this.defaultInputState.switch.validators],
        });
    }
}
