/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup
} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';

import {AttachmentHelper} from '../../../../shared/misc/helpers/attachment.helper';
import {EnvironmentHelper} from '../../../../shared/misc/helpers/environment.helper';
import {FormGroupPhoneInterface} from '../../../../shared/misc/presentationals/form-group-phone/form-group-phone.component';
import {
    GenericValidators,
    ValidationMaxLength,
    ValidationPicture
} from '../../../../shared/misc/validation/generic.validators';
import {LanguageEnumHelper} from '../../../../shared/translation/helper/language.enum';
import {InputAutocompleteComponent} from '../../../../shared/ui/forms/input-autocomplete/input-autocomplete.component';
import {
    InputSelectDropdownComponent,
    SelectOption,
} from '../../../../shared/ui/forms/input-select-dropdown/input-select-dropdown.component';
import {
    CountryEnum,
    countryEnumHelper,
} from '../../enums/country.enum';
import {UserCaptureModel} from './user-capture.model';

const MAX_NAME_LENGTH = 50;
const MAX_POSITION_LENGTH = 100;

export type UserCaptureComponentFocus = 'language' | 'country';

interface ValidationUserCapture {
    picture: ValidationPicture;
    name: ValidationMaxLength;
    position: ValidationMaxLength;
}

@Component({
    selector: 'ss-user-capture',
    templateUrl: './user-capture.component.html',
    styleUrls: ['./user-capture.component.scss'],
})
export class UserCaptureComponent implements OnInit, AfterViewInit {
    /**
     * @description Input property with default values
     * @param {UserCaptureModel} defaultValues
     */
    @Input()
    public set defaultValues(defaultValues: UserCaptureModel) {
        this.userCaptureModel = defaultValues;
        this._formGroupPhone = {valid: true, value: this.userCaptureModel.phoneNumbers};
        this._setValidations();
        this._setupForm();
    }

    /**
     * @description Input property with crafts
     * @type {Array}
     */
    @Input() public crafts: SelectOption[] = [];

    /**
     * @description Input property that defines the input to have focus
     * @param {UserCaptureComponentFocus} focus
     */
    @Input()
    public focus: UserCaptureComponentFocus;

    /**
     * @description Property that outputs user capture resource when form is submitted
     * @type {EventEmitter<UserCaptureModel>}
     */
    @Output() public onSubmit: EventEmitter<UserCaptureModel> = new EventEmitter<UserCaptureModel>();

    /**
     * @description EventEmitter that emits when creation is cancelled
     * @type {EventEmitter<void>}
     */
    @Output() public onCancel: EventEmitter<void> = new EventEmitter<void>();

    @ViewChild('countryInput')
    public countryInput: InputAutocompleteComponent;

    @ViewChild('languageInput')
    public languageInput: InputSelectDropdownComponent;

    public countryLabels: string[] = [];

    public languages: SelectOption[] = LanguageEnumHelper.getSelectOptions();

    /**
     * @description Property with user capture model values
     */
    public userCaptureModel: UserCaptureModel;

    /**
     * @description Property to set user form
     */
    public form: UntypedFormGroup;

    /**
     * @description Property with default profile picture
     * @type {string}
     */
    public profileDefaultPicture: string;

    /**
     * @description Property with profile picture accepted pattern
     * @type {RegExp}
     */
    public picturePattern = new RegExp(/(image\/((jpg)|(jpeg)|(png)|(bmp)|(gif)))/i);

    /**
     * @description Property with form validations
     * @type {ValidationUserCapture}
     */
    public validations: ValidationUserCapture;

    private _countryOptions: SelectOption[] = [];

    private _formGroupPhone: FormGroupPhoneInterface;

    constructor(private _attachmentHelper: AttachmentHelper,
                private _environmentHelper: EnvironmentHelper,
                private _formBuilder: UntypedFormBuilder,
                private _translateService: TranslateService) {
    }

    ngOnInit(): void {
        this._setValidations();
        this._setCountries();
        this._setupForm();
    }

    ngAfterViewInit(): void {
        this._handleFocus();
    }

    public _handleFocus(): void {
        switch (this.focus) {
            case 'country':
                this.countryInput.setFocus();
                break;
            case 'language':
                this.languageInput.setFocus();
                break;
        }
    }

    /**
     * @description Triggered when picture is changed
     * @param {File} picture
     */
    public onChangePicture(picture: File | null): void {
        if (!picture) {
            this._changeProfilePicture();
        }
    }

    /**
     * @description Returns the current state of submit button
     * @returns {boolean}
     */
    public isFormValid(): boolean {
        return this.form.valid && this._formGroupPhone.valid;
    }

    /**
     * @description Method called when form submission is triggered
     */
    public onSubmitForm(): void {
        const {picture, gender, firstName, lastName, position, crafts, language, country} = this.form.value;
        const countryCode = this._getCountryCodeFromCountryName(country);
        const phoneNumbers = this._formGroupPhone.value;
        const user: UserCaptureModel = {
            picture,
            gender,
            firstName,
            lastName,
            position,
            crafts,
            phoneNumbers,
            locale: language,
            country: countryCode,
        };

        this.onSubmit.emit(user);
    }

    /**
     * @description Method called when form is canceled
     */
    public onCancelForm(): void {
        this.onCancel.emit();
    }

    /**
     * @description Triggered when a phone number is inserted
     * @param {FormGroupPhoneInterface} phones
     */
    public onChangePhones(phones: FormGroupPhoneInterface): void {
        this._formGroupPhone = phones;
    }

    private _changeProfilePicture(): void {
        this.profileDefaultPicture = `/assets/images/user/neutral.png`;
    }

    private _getCountryCodeFromCountryName(countryName: string): CountryEnum | undefined {
        return this._countryOptions.find(({label}) => countryName === label)?.value;
    }

    private _getCountryNameFromCountryCode(countryCode: CountryEnum): string | undefined {
        return this._countryOptions.find(({value}) => countryCode === value)?.label;
    }

    private _setCountries(): void {
        this._countryOptions = countryEnumHelper.getValues().map(value => ({
            value,
            label: this._translateService.instant(countryEnumHelper.getLabelByValue(value)),
        }));
        this.countryLabels = this._countryOptions.map(country => country.label);
    }

    private _setValidations() {
        const maxSizeInMb = this._environmentHelper.getConfiguration().imageUploadMaxFileSize;
        this.validations = {
            picture: {
                extension: this.picturePattern,
                maxSize: this._attachmentHelper.convertMbToBytes(maxSizeInMb),
                maxSizeInMb,
            },
            name: {
                maxLength: MAX_NAME_LENGTH,
            },
            position: {
                maxLength: MAX_POSITION_LENGTH,
            },
        };
    }

    private _setupForm(): void {
        if (!this.userCaptureModel) {
            return;
        }

        const country = this._getCountryNameFromCountryCode(this.userCaptureModel.country);

        this.form = this._formBuilder.group({
            picture: [this.userCaptureModel.picture,
                [GenericValidators.isValidExtensionFile(this.validations.picture.extension),
                    GenericValidators.isValidFileSize(this.validations.picture.maxSize)]],
            firstName: [this.userCaptureModel.firstName,
                [GenericValidators.isRequired(),
                    GenericValidators.isMaxLength(this.validations.name.maxLength)]],
            lastName: [this.userCaptureModel.lastName,
                [GenericValidators.isRequired(),
                    GenericValidators.isMaxLength(this.validations.name.maxLength)]],
            gender: [this.userCaptureModel.gender, [GenericValidators.isRequired()]],
            position: [this.userCaptureModel.position],
            crafts: [this.userCaptureModel.crafts],
            language: [this.userCaptureModel.locale, GenericValidators.isRequired()],
            country: [country, [
                GenericValidators.isRequired(),
                GenericValidators.findInArray(this.countryLabels, 'Generic_ValidationInvalidCountry'),
            ]],
        });

        if (!this.userCaptureModel.picture && typeof this.form.controls['gender'].value !== 'undefined') {
            this._changeProfilePicture();
        }
    }
}
