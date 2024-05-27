/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import {
    UntypedFormArray,
    UntypedFormBuilder,
    UntypedFormControl,
    UntypedFormGroup
} from '@angular/forms';

import {SelectOption} from '../../../ui/forms/input-select-dropdown/input-select-dropdown.component';
import {PhoneDescriptionEnumHelper} from '../../data/phone-description.enum';
import {GenericValidators} from '../../validation/generic.validators';

export interface FormGroupPhoneValueInterface {
    type: string;
    countryCode: string;
    number: string;
}

export interface FormGroupPhoneInterface {
    value: FormGroupPhoneValueInterface[];
    valid: boolean;
}

const COUNTRY_CODE_PATTERN = new RegExp(/^[+][1-9][0-9]{0,3}$/);
const NUMBER_PATTERN = new RegExp(/^[1-9][0-9]{4,24}$/);
const NUMBER_INVALID_KEY = 'Generic_ValidationInvalidPhone';

@Component({
    selector: 'ss-form-group-phone',
    templateUrl: './form-group-phone.component.html',
    styleUrls: ['./form-group-phone.component.scss'],
})
export class FormGroupPhoneComponent implements OnInit, OnChanges {
    /**
     * @description Property with default phones
     */
    @Input()
    public defaultPhones: FormGroupPhoneValueInterface[];

    /**
     * @description Emits valid form group phones
     * @type {EventEmitter<FormGroupPhoneValueInterface[]>}
     */
    @Output()
    public onChange: EventEmitter<FormGroupPhoneInterface> = new EventEmitter<FormGroupPhoneInterface>();

    /**
     * @description Property to set form
     */
    public form: UntypedFormGroup;

    /**
     * @description Array with phone number type
     * @type {Array}
     */
    public types: SelectOption[] = PhoneDescriptionEnumHelper.getSelectOptions();

    /**
     * @description Object with error messages to present
     * @type {[boolean]}
     */
    public showErrorMessage: boolean[] = [false];

    private _defaultValues: FormGroupPhoneValueInterface = {
        type: 'MOBILE',
        countryCode: '',
        number: ''
    };

    private _formBuilder: UntypedFormBuilder = new UntypedFormBuilder();

    ngOnInit() {
        this._setupForm();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.defaultPhones.previousValue !== changes.defaultPhones.currentValue) {
            this._setupForm();
        }
    }

    /**
     * @description Method to get form control phones
     * @returns {FormControl[]}
     */
    public get getPhoneControls(): UntypedFormControl[] {
        return this.form.controls['phones']['controls'];
    }

    /**
     * @description Add phone form array
     * @param {FormGroupPhoneValueInterface} phone
     */
    public addPhone(phone?: FormGroupPhoneValueInterface): void {
        const phones: UntypedFormArray = this.form.get('phones') as UntypedFormArray;
        phones.push(phone ? this._getPhone(phone) : this._getDefaultPhone());
    }

    /**
     * @description Remove phone form phone array according to index received
     * @param {number} index
     */
    public removePhone(event: Event, index: number): void {
        event.preventDefault();
        const phones: UntypedFormArray = this.form.get('phones') as UntypedFormArray;
        phones.removeAt(index);

        this._handleOutputValue();
    }

    /**
     * @description Method to update phone number validators according to phone number added
     * @param {number} index
     */
    public updateValidators(index: number): void {
        const phoneGroup: UntypedFormGroup = this.form.controls['phones']['controls'];
        const {type, countryCode, number} = phoneGroup[index].controls;

        if ((countryCode.value && countryCode.value !== '+') || number.value) {
            this._setValidators(type, countryCode, number, index);
        } else {
            this._clearValidators(type, countryCode, number, index);
        }

        this._handleOutputValue();
    }

    private _setupForm(): void {
        this.form = this._formBuilder.group({phones: this._formBuilder.array([])});

        if (this.defaultPhones && this.defaultPhones.length) {
            this.defaultPhones.forEach((phone: FormGroupPhoneValueInterface) => this.addPhone(phone));
        } else {
            this.addPhone();
        }

        this._handleOutputValue();
    }

    private _getPhone(phone: FormGroupPhoneValueInterface): UntypedFormGroup {
        const {type, countryCode, number} = phone;

        return this._formBuilder.group({
            type: [type],
            countryCode: [countryCode],
            number: [number]
        });
    }

    private _getDefaultPhone(): UntypedFormGroup {
        return this._formBuilder.group({
            type: [this._defaultValues.type],
            countryCode: [this._defaultValues.countryCode],
            number: [this._defaultValues.number]
        });
    }

    private _setValidators(type: UntypedFormControl,
                           countryCode: UntypedFormControl,
                           phoneNumber: UntypedFormControl,
                           index: number): void {
        this.showErrorMessage[index] = true;

        type.setValidators([GenericValidators.isRequired()]);
        countryCode.setValidators([GenericValidators.isPattern(COUNTRY_CODE_PATTERN)]);
        phoneNumber.setValidators([GenericValidators.isPattern(NUMBER_PATTERN, NUMBER_INVALID_KEY)]);

        type.markAsTouched();
        countryCode.markAsTouched();
        phoneNumber.markAsTouched();

        type.updateValueAndValidity();
        countryCode.updateValueAndValidity();
        phoneNumber.updateValueAndValidity();
    }

    private _clearValidators(type: UntypedFormControl,
                             countryCode: UntypedFormControl,
                             phoneNumber: UntypedFormControl,
                             index: number): void {
        this.showErrorMessage[index] = false;

        type.clearValidators();
        countryCode.clearValidators();
        phoneNumber.clearValidators();

        type.markAsUntouched();
        countryCode.markAsUntouched();
        phoneNumber.markAsUntouched();

        type.updateValueAndValidity();
        countryCode.updateValueAndValidity();
        phoneNumber.updateValueAndValidity();
    }

    private _handleOutputValue(): void {
        const validValues: FormGroupPhoneValueInterface[] = this.getPhoneControls
            .filter(this._isCompleteControl.bind(this))
            .map((control: UntypedFormControl) => control.value);

        this.onChange.emit({
            value: validValues,
            valid: this.form.valid
        });
    }

    private _isCompleteControl(control: UntypedFormControl): boolean {
        const {type, countryCode, number} = control.value;
        return this.form.valid && type && countryCode && number;
    }
}
