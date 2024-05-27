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

export const INPUT_TEXT_DEFAULT_STATE: any = {
    value: '',
    label: '',
    automationAttr: 'text',
    name: 'text',
    validators: [],
    isDisabled: false,
    isRequired: false,
    maxCharacter: 0,
    showCounter: true,
    controlName: 'text',
    fixedValue: undefined
};

@Component({
    templateUrl: './input-text.test.component.html'
})
export class InputTextTestComponent {
    public formGroup: UntypedFormGroup;

    public defaultInputState: any = {
        text: INPUT_TEXT_DEFAULT_STATE,
    };

    constructor(private _formBuilder: UntypedFormBuilder) {
    }

    public setForm(): void {
        this.formGroup = this._formBuilder.group({
            [this.defaultInputState.text.controlName]: [this.defaultInputState.text.value, this.defaultInputState.text.validators],
        });
    }
}
