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

export const RADIO_BUTTON_DEFAULT_STATE: any = {
    value: 'value',
    automationAttr: 'radio-button',
    name: 'radio',
    icon: 'icon-test',
    dimension: 'normal',
    validators: [],
    isChecked: false,
    isDisabled: false,
    isRequired: false,
    controlName: 'radio',
};

@Component({
    templateUrl: './radio-button.test.component.html',
})
export class RadioButtonTestComponent {
    public formGroup: UntypedFormGroup;

    public defaultInputState: any = {
        radioButton: RADIO_BUTTON_DEFAULT_STATE,
    };

    constructor(private _formBuilder: UntypedFormBuilder) {
    }

    public setForm(): void {
        this.formGroup = this._formBuilder.group({
            [this.defaultInputState.radioButton.controlName]: ['otherRadioButton', this.defaultInputState.radioButton.validators],
        });
    }
}
