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

export const INPUT_TEXTAREA_USER_DEFAULT_STATE: any = {
    value: '',
    label: '',
    automationAttr: 'textareaUser',
    name: 'textareaUser',
    validators: [],
    isDisabled: false,
    isCollapsed: false,
    isScrollable: false,
    isRequired: false,
    isAutosize: true,
    maxCharacter: 0,
    controlName: 'textareaUser',
    user: null,
    showCounter: false,
    textareaMinHeight: 0,
    size: 'normal',
};

@Component({
    templateUrl: './input-textarea-user.test.component.html',
})
export class InputTextareaUserTestComponent {
    public formGroup: UntypedFormGroup;

    public defaultInputState: any = {
        textareaUser: INPUT_TEXTAREA_USER_DEFAULT_STATE,
    };

    constructor(private _formBuilder: UntypedFormBuilder) {
    }

    public setForm(): void {
        this.formGroup = this._formBuilder.group({
            [this.defaultInputState.textareaUser.controlName]: [
                this.defaultInputState.textareaUser.value,
                this.defaultInputState.textareaUser.validators,
            ],
        });
    }
}
