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

export const INPUT_TEXTAREA_DEFAULT_STATE: any = {
    value: '',
    label: '',
    automationAttr: 'textarea',
    name: 'textarea',
    validators: [],
    isDisabled: false,
    isRequired: false,
    isAutosize: true,
    maxCharacter: 0,
    showCounter: true,
    controlName: 'textarea',
};

@Component({
    templateUrl: './input-textarea.test.component.html'
})
export class InputTextareaTestComponent {
    public formGroup: UntypedFormGroup;

    public defaultInputState: any = {
        textarea: INPUT_TEXTAREA_DEFAULT_STATE,
    };

    constructor(private _formBuilder: UntypedFormBuilder) {
    }

    public setForm(): void {
        this.formGroup = this._formBuilder.group({
            [this.defaultInputState.textarea.controlName]: [this.defaultInputState.textarea.value, this.defaultInputState.textarea.validators],
        });
    }
}
