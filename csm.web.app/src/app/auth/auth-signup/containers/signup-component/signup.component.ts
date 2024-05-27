/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import {
    FormControl,
    UntypedFormBuilder,
    UntypedFormGroup,
    ValidatorFn,
} from '@angular/forms';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {clone} from 'lodash';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {CraftResource} from '../../../../craft/api/resources/craft.resource';
import {AuthService} from '../../../../shared/authentication/services/auth.service';
import {CraftActions} from '../../../../shared/master-data/store/crafts/craft.actions';
import {CraftSliceService} from '../../../../shared/master-data/store/crafts/craft-slice.service';
import {PhoneNumber} from '../../../../shared/misc/api/datatypes/phone-number.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AttachmentHelper} from '../../../../shared/misc/helpers/attachment.helper';
import {EnvironmentHelper} from '../../../../shared/misc/helpers/environment.helper';
import {
    FormGroupPhoneInterface,
    FormGroupPhoneValueInterface,
} from '../../../../shared/misc/presentationals/form-group-phone/form-group-phone.component';
import {
    GenericValidators,
    ValidationMaxLength,
    ValidationPicture
} from '../../../../shared/misc/validation/generic.validators';
import {
    LanguageEnum,
    LanguageEnumHelper,
} from '../../../../shared/translation/helper/language.enum';
import {TranslateHelper} from '../../../../shared/translation/helper/translate.helper';
import {COLORS} from '../../../../shared/ui/constants/colors.constant';
import {SelectOption} from '../../../../shared/ui/forms/input-select-dropdown/input-select-dropdown.component';
import {
    WizardStep,
    WizardStepsComponent
} from '../../../../shared/ui/wizard-steps/wizard-steps.component';
import {SaveUserResource} from '../../../../user/api/resources/save-user.resource';
import {LegalDocumentResource} from '../../../../user/api/resources/user-legal-documents.resource';
import {LegalDocumentsActions} from '../../../../user/store/legal-documents/legal-documents.actions';
import {LegalDocumentsQueries} from '../../../../user/store/legal-documents/legal-documents.queries';
import {UserActions} from '../../../../user/store/user/user.actions';
import {UserQueries} from '../../../../user/store/user/user.queries';
import {
    CountryEnum,
    countryEnumHelper,
} from '../../../../user/user-common/enums/country.enum';

const NAME_MAX_SIZE = 50;
const POSITION_MAX_SIZE = 100;

export enum SignUpWizardStepsEnum {
    PersonalInfoStep = 0,
    LanguageAndCountryStep = 1,
    JobInfoStep = 2
}

interface ValidationSignUp {
    profilePicture: ValidationPicture;
    names: ValidationMaxLength;
    position: ValidationMaxLength;
}

@Component({
    selector: 'ss-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit, OnDestroy {

    @ViewChild('wizardStepsComponent', {static: false})
    public wizardStepsComponent: WizardStepsComponent;

    public activeStep = SignUpWizardStepsEnum.PersonalInfoStep;

    /**
     * @description Array with crafts
     * @type {Array}
     */
    public craftList: any[] = [];

    public countryLabels: string[] = [];

    public legalDocumentsList: LegalDocumentResource[] = [];

    /**
     * @description Property with requesting status
     * @type {boolean}
     */
    public isRequesting = false;

    public isRequestingLegalDocuments = false;

    /**
     * @description Define the button icon arrow color
     * @type {string}
     */
    public iconArrowColor: string = COLORS.white;

    /**
     * @description Property to set signup form
     */
    public languages: SelectOption[] = LanguageEnumHelper.getSelectOptions();

    /**
     * @description Object with all the signup form default values
     * @type {Object}
     */
    public signupDefaultValues: any = {
        profilePicture: null,
        gender: 'MALE',
        firstName: '',
        lastName: '',
        position: '',
        crafts: [],
        dataProtectionAccepted: false,
        language: '',
        country: '',
    };

    /**
     * @description Property to set signup form
     */
    public signupForm: UntypedFormGroup;

    /**
     * @description Property with profile picture accepted pattern
     * @type {RegExp}
     */
    public profilePicturePattern = new RegExp(/(image\/((jpg)|(jpeg)|(png)|(bmp)|(gif)))/i);

    /**
     * @description Property with default profile picture
     * @type {string}
     */
    public profileDefaultPicture = '/assets/images/user/neutral.png';

    /**
     * @description Property with default profile picture flag
     * @type {boolean}
     */
    public isProfilePictureDefault = true;

    /**
     * @description Property with form validations
     * @type {ValidationSignUp}
     */
    public validations: ValidationSignUp;

    public wizardSteps: WizardStep[] = [
        {
            label: 'Generic_PersonalInfoLabel',
            icon: 'user',
            active: true,
            disabled: false,
        },
        {
            label: 'Generic_LanguageAndCountry',
            icon: 'globe',
            active: false,
            disabled: true,
        },
        {
            label: 'Generic_JobInfoLabel',
            icon: 'info-marker',
            active: false,
            disabled: true,
        }];

    private _countryOptions: SelectOption<CountryEnum>[] = [];

    private _formGroupPhone: FormGroupPhoneInterface;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _valueChangeSubscription = new Subscription();

    constructor(private _attachmentHelper: AttachmentHelper,
                private _authService: AuthService,
                private _craftSliceService: CraftSliceService,
                private _environmentHelper: EnvironmentHelper,
                private _formBuilder: UntypedFormBuilder,
                private _legalDocumentsQueries: LegalDocumentsQueries,
                private _userQueries: UserQueries,
                private _router: Router,
                private _store: Store<State>,
                private _translateHelper: TranslateHelper,
                private _translateService: TranslateService) {
    }

    ngOnInit() {
        this._setValidations();
        this._setCountries();
        this._requestCrafts();
        this._setupForm();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._disposableSubscriptions.unsubscribe();
    }

    public handleWizardStepsChange(wizardSteps: WizardStep[]): void {
        this.wizardSteps = wizardSteps;

        this._setActiveStep();
    }

    /**
     * @description Triggered when profile picture changes and handle it according to it - male, female or inserted
     * @param profilePicture
     */
    public onChangeProfilePicture(profilePicture: Blob | null): void {
        if (profilePicture === null) {
            this.isProfilePictureDefault = true;
            return;
        }
        this.isProfilePictureDefault = false;
    }

    /**
     * @description Triggered when submit form is clicked
     * @param value
     */
    public onSubmitForm(value: any): void {
        this._submitUserData(value);
    }

    /**
     * @description Returns the current state of submit button
     * @returns {boolean}
     */
    public isFormValid(): boolean {
        return this._formGroupPhone && this.signupForm.valid && this._formGroupPhone.valid;
    }

    /**
     * @description Handle logout button clicked
     */
    public cancelSignUp(): void {
        this._authService.logout();
    }

    /**
     * @description Triggered when user clicks on Next Button
     */
    public handleNext(): void {
        switch (this.activeStep) {
            case SignUpWizardStepsEnum.PersonalInfoStep:
                if (this._firstStepValid()) {
                    this.wizardSteps[1].disabled = !this._firstStepValid();
                    this.wizardSteps = clone(this.wizardSteps);
                    this.wizardStepsComponent.advanceStep();
                } else {
                    this._setErrorsFirstStep();
                }
                break;
            case SignUpWizardStepsEnum.LanguageAndCountryStep:
                if (this._secondStepValid()) {
                    this._setAppLanguage(this.signupForm.controls['country'].value, this.signupForm.controls['language'].value);
                    this._requestLegalDocuments();

                } else {
                    this._setErrorsSecondStep();
                }
                break;
        }
    }

    /**
     * @description Triggered when user clicks on Back Button
     */
    public handleBack(): void {
        this.wizardStepsComponent.regressStep();
    }

    /**
     * @description Triggered when a phone number is inserted
     * @param {FormGroupPhoneInterface} phone
     */
    public onChangePhones(phone: FormGroupPhoneInterface): void {
        this._formGroupPhone = phone;
    }

    private _getCountryCodeFromCountryName(countryName: string): CountryEnum {
        return this._countryOptions.find(({label}) => countryName === label)?.value;
    }

    private _getCountryNameFromCountryCode(countryCode: CountryEnum): string {
        return this._countryOptions.find(({value}) => countryCode === value)?.label;
    }

    private _getCountryFormValidators(): ValidatorFn[] {
        return [
            GenericValidators.isRequired(),
            GenericValidators.findInArray(this.countryLabels, 'Generic_ValidationInvalidCountry'),
        ];
    }

    private _handleLanguageChange(): void {
        const countryName = this.signupForm.value.country;
        const countryCode = this._getCountryCodeFromCountryName(countryName);

        this._setCountries();
        this._updateCountryFormControl(countryCode);
    }

    private _submitUserData(value: any): void {
        const {gender, firstName, lastName, position, crafts, EULA, language} = value;
        const country = this._getCountryCodeFromCountryName(value.country);
        const user: SaveUserResource = new SaveUserResource();
        const legalDocumentListIds = this.legalDocumentsList.map(document => document.id);

        user.gender = gender;
        user.firstName = firstName;
        user.lastName = lastName;
        user.position = position;
        user.craftIds = crafts;
        user.eulaAccepted = EULA || false;
        user.locale = language;
        user.country = country;
        user.phoneNumbers = this._formGroupPhone.value
            .map((phoneNumber: FormGroupPhoneValueInterface) =>
                new PhoneNumber(phoneNumber.countryCode, phoneNumber.number, phoneNumber.type));

        const picture = this.isProfilePictureDefault ? undefined : value.profilePicture;
        this._store.dispatch(new UserActions.Create.One(user, legalDocumentListIds, picture));
    }

    private _requestCrafts(): void {
        this._store.dispatch(new CraftActions.Request.Crafts());
    }

    private _requestLegalDocuments(): void {
        const country = this._getCountryCodeFromCountryName(this.signupForm.controls['country'].value);
        const language = this.signupForm.controls['language'].value;

        this._store.dispatch(new LegalDocumentsActions.Request.UnregisteredAll(country, language));
    }

    private _setAppLanguage(country: string, language: LanguageEnum): void {
        const countryCode = this._getCountryCodeFromCountryName(country);
        const cultureLanguage = `${language}-${countryCode}`;

        this._translateHelper.configLanguage(language, cultureLanguage);
    }

    private _setCountries(): void {
        this._countryOptions = countryEnumHelper.getValues().map(value => ({
            value,
            label: this._translateService.instant(countryEnumHelper.getLabelByValue(value)),
        }));
        this.countryLabels = this._countryOptions.map(country => country.label);
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._craftSliceService
                .observeCraftList()
                .subscribe(this._parseCrafts.bind(this))
        );

        this._disposableSubscriptions.add(
            this._userQueries
                .observeCurrentUserRequestStatus()
                .subscribe(this._handleCurrentUserRequestStatus.bind(this))
        );

        this._disposableSubscriptions.add(
            this._legalDocumentsQueries
                .observeLegalDocumentsRequestStatus()
                .subscribe(this._handleRequestStatus.bind(this))
        );

        this._disposableSubscriptions.add(
            this._legalDocumentsQueries
                .observeLegalDocumentsList()
                .pipe(filter(documents => !!documents?.length))
                .subscribe(legalDocuments => this._setLegalDocuments(legalDocuments))
        );

        this._disposableSubscriptions.add(
            this._translateService.onDefaultLangChange
                .subscribe(() => this._handleLanguageChange())
        );
    }

    private _setActiveStep(): void {
        this.activeStep = this.wizardSteps.findIndex(step => step.active);
    }

    private _setValidations(): void {
        const maxSizeInMb = this._environmentHelper.getConfiguration().imageUploadMaxFileSize;
        this.validations = {
            profilePicture: {
                extension: this.profilePicturePattern,
                maxSize: this._attachmentHelper.convertMbToBytes(maxSizeInMb),
                maxSizeInMb,
            },
            names: {
                maxLength: NAME_MAX_SIZE,
            },
            position: {
                maxLength: POSITION_MAX_SIZE,
            },
        };
    }

    private _parseCrafts(crafts: CraftResource[]): void {
        this.craftList = crafts.map((craft: CraftResource) => ({
            label: craft.name,
            value: craft.id,
        }));
    }

    private _handleCurrentUserRequestStatus(status: RequestStatusEnum): void {
        this.isRequesting = status === RequestStatusEnum.progress;

        if (status === RequestStatusEnum.success) {
            this._router.navigate(['/']);
        }
    }

    private _handleRequestStatus(status: RequestStatusEnum): void {
        this.isRequestingLegalDocuments = status === RequestStatusEnum.progress;

        if (status === RequestStatusEnum.success && this.activeStep === SignUpWizardStepsEnum.LanguageAndCountryStep) {
            this.wizardSteps[2].disabled = !this._secondStepValid();
            this.wizardSteps = clone(this.wizardSteps);
            this.wizardStepsComponent.advanceStep();
        }
    }

    private _setupForm(): void {
        const countryName = this._getCountryNameFromCountryCode(this.signupDefaultValues.country);

        this.signupForm = this._formBuilder.group({
            profilePicture: [this.signupDefaultValues.profilePicture,
                [GenericValidators.isValidExtensionFile(this.validations.profilePicture.extension),
                    GenericValidators.isValidFileSize(this.validations.profilePicture.maxSize)]],
            gender: [this.signupDefaultValues.gender],
            firstName: [this.signupDefaultValues.firstName, [GenericValidators.isRequired(),
                GenericValidators.isMaxLength(this.validations.names.maxLength)]],
            lastName: [this.signupDefaultValues.lastName, [GenericValidators.isRequired(),
                GenericValidators.isMaxLength(this.validations.names.maxLength)]],
            position: [this.signupDefaultValues.position, [GenericValidators.isMaxLength(this.validations.position.maxLength)]],
            crafts: [this.signupDefaultValues.crafts],
            dataProtectionAccepted: [this.signupDefaultValues.dataProtectionAccepted, GenericValidators.isChecked()],
            language: [this.signupDefaultValues.locale, GenericValidators.isRequired()],
            country: [countryName, this._getCountryFormValidators()],
        });

        this._valueChangeSubscription.unsubscribe();
        this._valueChangeSubscription = new Subscription();

        this._valueChangeSubscription.add(
            this.signupForm.valueChanges.subscribe(() => this._checkEnableStep())
        );
    }

    private _addLegalDocumentsToForm(legalDocuments: LegalDocumentResource[]): void {
        legalDocuments.forEach(legalDocument => {
            this.signupForm.addControl(legalDocument.type, new FormControl(false, GenericValidators.isChecked()));
        });
    }

    private _removeLegalDocumentsControlFromForm(legalDocuments: LegalDocumentResource[]): void {
        legalDocuments.forEach(legalDocument => {
            this.signupForm.removeControl(legalDocument.type);
        });
    }

    private _checkEnableStep(): void {
        this.wizardSteps[1].disabled = !this._firstStepValid() || this.wizardSteps[1].disabled;
        this.wizardSteps[2].disabled = (!this._firstStepValid() || !this._secondStepValid()) || this.wizardSteps[2].disabled;
        this.wizardSteps = clone(this.wizardSteps);
    }

    private _setErrorsFirstStep(): void {
        if (!this.signupForm.controls['firstName'].valid) {
            this.signupForm.controls['firstName'].markAsTouched();
        }
        if (!this.signupForm.controls['lastName'].valid) {
            this.signupForm.controls['lastName'].markAsTouched();
        }
    }

    private _setErrorsSecondStep(): void {
        if (!this.signupForm.controls['language'].valid) {
            this.signupForm.controls['language'].markAsTouched();
        }
        if (!this.signupForm.controls['country'].valid) {
            this.signupForm.controls['country'].markAsTouched();
        }
    }

    private _setLegalDocuments(legalDocuments: LegalDocumentResource[]): void {
        this._removeLegalDocumentsControlFromForm(this.legalDocumentsList);

        this.legalDocumentsList = legalDocuments;

        this._addLegalDocumentsToForm(legalDocuments);
    }

    private _updateCountryFormControl(countryCode: CountryEnum): void {
        const currentCountryName = this.signupForm.value.country;
        const newCountryName = this._getCountryNameFromCountryCode(countryCode) || currentCountryName;

        this.signupForm.get('country').clearValidators();
        this.signupForm.get('country').setValue(newCountryName, {emitEvent: false});
        this.signupForm.get('country').setValidators(this._getCountryFormValidators());
        this.signupForm.get('country').updateValueAndValidity();
    }

    private _firstStepValid(): boolean {
        return this.signupForm.controls['firstName'].valid && this.signupForm.controls['lastName'].valid;
    }

    private _secondStepValid(): boolean {
        return this.signupForm.controls['language'].valid && this.signupForm.controls['country'].valid;
    }
}
