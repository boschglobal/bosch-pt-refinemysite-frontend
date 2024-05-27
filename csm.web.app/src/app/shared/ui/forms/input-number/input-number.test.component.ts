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

export const INPUT_NUMBER_DEFAULT_STATE: any = {
    value: '',
    label: '',
    automationAttr: 'number',
    name: 'number',
    validators: [],
    isDisabled: false,
    isRequired: false,
    controlName: 'number',
    max: undefined,
    min: undefined,
    step: 1,
    icon: undefined,
    maxDigits: undefined
};

@Component({
    templateUrl: './input-number.test.component.html'
})
export class InputNumberTestComponent {
    public formGroup: UntypedFormGroup;

    public defaultInputState: any = {
        number: INPUT_NUMBER_DEFAULT_STATE,
    };

    constructor(private _formBuilder: UntypedFormBuilder) {
    }

    public setForm(): void {
        this.formGroup = this._formBuilder.group({
            [this.defaultInputState.number.controlName]: [this.defaultInputState.number.value, this.defaultInputState.number.validators],
        });
    }
}
