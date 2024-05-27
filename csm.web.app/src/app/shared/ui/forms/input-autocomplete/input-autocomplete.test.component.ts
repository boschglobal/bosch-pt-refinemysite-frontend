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

import {SearchTypeInputAutocompleteEnum} from './input-autocomplete.component';

export const INPUT_AUTOCOMPLETE_DEFAULT_STATE: any = {
    alwaysShowOptions: false,
    value: null,
    label: '',
    automationAttr: 'autocomplete',
    name: 'autocomplete',
    validators: [],
    isDisabled: false,
    isRequired: false,
    showCounter: true,
    maxCharacter: 0,
    list: ['1', '2', '3', '4', '5'],
    maxOptions: -1,
    searchType: SearchTypeInputAutocompleteEnum.Any,
    sortList: true,
    controlName: 'autocomplete',
};

@Component({
    selector: 'ss-input-autocomplete-test',
    templateUrl: './input-autocomplete.test.component.html',
    styles: [
        `form {
            max-width: 300px;
        }`,
    ],
})
export class InputAutocompleteTestComponent {
    public formGroup: UntypedFormGroup;

    public defaultInputState: any = {
        autocomplete: Object.assign({}, INPUT_AUTOCOMPLETE_DEFAULT_STATE),
    };

    constructor(private _formBuilder: UntypedFormBuilder) {
        this.setForm();
    }

    public setForm(): void {
        const {controlName, value, validators} = this.defaultInputState.autocomplete;

        this.formGroup = this._formBuilder.group({
            [controlName]: [value, validators],
        });
    }
}
