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

import {
    SelectOption,
    SelectOptionGroup
} from './input-select-dropdown.component';

export const INPUT_SELECT_DEFAULT_OPTIONS: SelectOption[] = [
    {value: 1, label: 'a'},
    {value: 2, label: 'b'},
    {value: 3, label: 'c'},
    {value: 4, label: 'd'},
    {value: 5, label: 'e'},
    {value: 6, label: 'f'},
    {value: 7, label: 'g'},
    {value: 8, label: 'h'},
    {value: 9, label: 'i'},
    {value: 10, label: 'j'},
];

export const INPUT_SELECT_DEFAULT_OPTION_GROUPS: SelectOptionGroup[] = [
    {
        options: [
            {value: 1, label: 'a'},
            {value: 2, label: 'b'},
        ],
    },
    {
        title: 'Foo',
        options: [
            {value: 3, label: 'c'},
            {value: 4, label: 'd'},
            {value: 5, label: 'e'},
        ],
    },
    {
        title: 'Bar',
        options: [
            {value: 6, label: 'f'},
            {value: 7, label: 'g'},
            {value: 8, label: 'h'},
            {value: 9, label: 'i'},
            {value: 10, label: 'j'},
        ],
    },
];

export const INPUT_SELECT_DEFAULT_STATE: any = {
    value: '',
    label: '',
    automationAttr: 'selectDropdown',
    name: 'selectDropdown',
    validators: [],
    isDisabled: false,
    isRequired: false,
    options: INPUT_SELECT_DEFAULT_OPTIONS,
    multiple: false,
    translateLabel: false,
    emptyOptionMessageKey: 'Generic_Clear',
    controlName: 'selectDropdown',
};

@Component({
    selector: 'ss-input-select-dropdown-test',
    templateUrl: './input-select-dropdown.test.component.html',
    styleUrls: ['./input-select-dropdown.test.component.scss'],
})
export class InputSelectDropdownTestComponent {
    public formGroup: UntypedFormGroup;

    public useOptionTemplate: boolean;

    public defaultInputState: any = {
        selectDropdown: Object.assign({}, INPUT_SELECT_DEFAULT_STATE),
    };

    constructor(private _formBuilder: UntypedFormBuilder) {
        this.setForm();
    }

    public setForm(): void {
        const {controlName, value, validators} = this.defaultInputState.selectDropdown;

        this.formGroup = this._formBuilder.group({
            [controlName]: [value, validators],
        });
    }
}
