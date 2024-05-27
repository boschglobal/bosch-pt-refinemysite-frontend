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

export const INPUT_PICTURE_DEFAULT_STATE: any = {
    value: null,
    automationAttr: 'picture',
    name: 'picture',
    label: '',
    validators: [],
    isDisabled: false,
    isRequired: false,
    accept: 'image/jpg,image/jpeg',
    acceptedPattern: /(image\/((jpg)|(jpeg)))/i,
    controlName: 'picture'
};

@Component({
    templateUrl: './input-picture.test.component.html'
})
export class InputPictureTestComponent {
    public formGroup: UntypedFormGroup;

    public defaultInputState: any = {
        picture: INPUT_PICTURE_DEFAULT_STATE,
    };

    constructor(private _formBuilder: UntypedFormBuilder) {
    }

    public setForm(): void {
        this.formGroup = this._formBuilder.group({
            [this.defaultInputState.picture.controlName]: [this.defaultInputState.picture.value, this.defaultInputState.picture.validators],
        });
    }
}
