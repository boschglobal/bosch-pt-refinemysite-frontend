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

export const CHECKBOX_BUTTON_DEFAULT_STATE: any = {
    value: null,
    automationAttr: 'checkbox',
    name: 'checkbox',
    icon: 'icon-test',
    id: null,
    dimension: 'normal',
    validators: [],
    isDisabled: false,
    isIndeterminate: false,
    isRequired: false,
    controlName: 'checkbox'
};

@Component({
    templateUrl: './checkbox-button.test.component.html'
})
export class CheckboxButtonTestComponent {
    public formGroup: UntypedFormGroup;

    public defaultInputState: any = {
        checkbox: CHECKBOX_BUTTON_DEFAULT_STATE,
    };

    constructor(private _formBuilder: UntypedFormBuilder) {
    }

    public setForm(): void {
        this.formGroup = this._formBuilder.group({
            [this.defaultInputState.checkbox.controlName]: [this.defaultInputState.checkbox.value, this.defaultInputState.checkbox.validators],
        });
    }
}
