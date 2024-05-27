/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup
} from '@angular/forms';

export const INPUT_MULTIPLE_SELECT_DEFAULT_STATE: any = {
    name: null,
    value: [],
    automationAttr: 'ss-input-multiple-select',
    isDisabled: false,
    isRequired: false,
    controlName: 'inputMultipleSelect',
    options: [],
    hasSelectAllOption: false,
    label: 'Input multiple select',
    validators: [],
};

@Component({
    templateUrl: './input-multiple-select.test.component.html'
})
export class InputMultipleSelectTestComponent {
    public defaultInputState = INPUT_MULTIPLE_SELECT_DEFAULT_STATE;

    public formGroup: UntypedFormGroup;

    constructor(private _formBuilder: UntypedFormBuilder) {
    }

    public setForm(): void {
        this.formGroup = this._formBuilder.group({
            [this.defaultInputState.controlName]: [this.defaultInputState.value, this.defaultInputState.validators]
        });
    }
}
