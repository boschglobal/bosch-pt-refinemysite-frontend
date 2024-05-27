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

import {MOCK_COLORS} from '../../../../../test/mocks/colors';

export const INPUT_COLORPICKER_DEFAULT_STATE: any = {
    value: '',
    automationAttr: 'colorpicker',
    name: 'colorpicker',
    validators: [],
    isDisabled: false,
    isRequired: false,
    controlName: 'colorpicker',
    options: MOCK_COLORS,
};

@Component({
    templateUrl: './input-colorpicker.test.component.html'
})
export class InputColorpickerTestComponent {
    public formGroup: UntypedFormGroup;

    public defaultInputState: any = {
        colorpicker: INPUT_COLORPICKER_DEFAULT_STATE,
    };

    constructor(private _formBuilder: UntypedFormBuilder) {
    }

    public setForm(): void {
        this.formGroup = this._formBuilder.group({
            [this.defaultInputState.colorpicker.controlName]: [this.defaultInputState.colorpicker.value, this.defaultInputState.colorpicker.validators],
        });
    }
}
