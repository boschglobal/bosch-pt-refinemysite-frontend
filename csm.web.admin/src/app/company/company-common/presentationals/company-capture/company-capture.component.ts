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
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import {
    AbstractControl,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators
} from '@angular/forms';
import {
    Observable,
    Subscription
} from 'rxjs';
import {map} from 'rxjs/operators';

import {ISO_3166_COUNTRIES} from '../../../../shared/misc/constants/contries.constant';
import {CaptureModeEnum} from '../../../../shared/misc/enums/capture-mode.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {GenericValidators} from '../../../../shared/misc/validation/generic.validators';
import {CompanySaveResource} from '../../api/resources/company-save.resource';
import {CompanyQueries} from '../../store/company.queries';

@Component({
    selector: 'ss-company-capture',
    templateUrl: './company-capture.component.html',
    styleUrls: ['./company-capture.component.scss']
})
export class CompanyCaptureComponent implements OnInit, OnDestroy {

    /**
     * @description Property to define when the capture has the mode to create or edit
     */
    @Input()
    public set defaultValues(defaultValues: CompanySaveResource) {
        this._defaultValues = defaultValues;
        this._resetForm();
    }

    /**
     * @description Property to define when the capture has the mode to create or edit
     */
    @Input()
    public mode: CaptureModeEnum;

    /**
     * @description Emits when the form is to be submitted to create a new company
     * @type {EventEmitter<CompanySaveResource>}
     */
    @Output()
    public create: EventEmitter<CompanySaveResource> = new EventEmitter<CompanySaveResource>();

    /**
     * @description Emits when the form is to be submitted to update a new company
     * @type {EventEmitter<CompanySaveResource>}
     */
    @Output()
    public update: EventEmitter<CompanySaveResource> = new EventEmitter<CompanySaveResource>();

    /**
     * @description Emits when the dialog is should be closed
     * @type {EventEmitter<null>}
     */
    @Output()
    public cancel: EventEmitter<null> = new EventEmitter();

    /**
     * @description Filtered country options for Street Address
     */
    public filteredCountriesForStreetAddress: Observable<string[]>;

    /**
     * @description Filtered country options for Post Box Address
     */
    public filteredCountriesForBoxAddress: Observable<string[]>;

    /**
     * @description Initialize form create
     */
    public form: UntypedFormGroup;

    /**
     * @description Post Box Address Form group
     */
    public postBoxAddressFormGroup: UntypedFormGroup;

    /**
     * @description Street Address Form group
     */
    public streetAddressFormGroup: UntypedFormGroup;

    public isSubmitting = false;

    /**
     * @description Store subscriptions
     */
    private _disposableSubscriptions: Subscription = new Subscription();

    /**
     * @description Default form values
     */
    private _defaultValues: CompanySaveResource = {} as CompanySaveResource;

    /**
     * @description Validators
     */
    private _validators: { [key: string]: { [key: string]: any } } = {
        name: {
            isRequired: true,
            maxLength: 100
        },
        postBox: {
            isRequired: true,
            maxLength: 100
        },
        street: {
            isRequired: true,
            maxLength: 100
        },
        houseNumber: {
            isRequired: true,
            maxLength: 10
        },
        zipCode: {
            isRequired: true,
            maxLength: 10
        },
        city: {
            isRequired: true,
            maxLength: 100
        },
        area: {
            isRequired: false,
            maxLength: 100
        },
        country: {
            isRequired: true,
            foundInCollection: ISO_3166_COUNTRIES,
        },
    };

    constructor(private _companyQueries: CompanyQueries,
                private _formBuilder: UntypedFormBuilder) {
    }

    ngOnInit(): void {
        this._setupForm();
        this._setSubscriptions();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    public handleSubmit(): void {
        this.isSubmitting = true;
        const {name, postBoxAddress, streetAddress} = this.form.getRawValue();
        const streetAddressData = this.form.controls['hasStreetAddress'].value ? streetAddress : null;
        const postBoxAddressData = this.form.controls['hasPostBoxAddress'].value ? postBoxAddress : null;
        const resource: CompanySaveResource = new CompanySaveResource(name, postBoxAddressData, streetAddressData);

        if (this.mode === CaptureModeEnum.Create) {
            this._handleCreate(resource);
        } else {
            this._handleUpdate(resource);
        }
    }

    public handleCancel(): void {
        this.cancel.emit();
        this._resetForm();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._companyQueries.observeCurrentCompanyRequestStatus()
                .subscribe(requestStatus => this._handleCaptureState(requestStatus))
        );
    }

    private _handleCaptureState(requestStatus: RequestStatusEnum): void {
        this.isSubmitting = requestStatus === RequestStatusEnum.Progress;
    }

    private _getValidatorsByFormControl(formControl: string): any[] {
        const validators = [];

        if (this._validators[formControl].isRequired) {
            validators.push(GenericValidators.isRequired());
        }

        if (this._validators[formControl].maxLength) {
            validators.push(GenericValidators.isMaxLength(this._validators[formControl].maxLength));
        }

        if (this._validators[formControl].max) {
            validators.push(Validators.max(this._validators[formControl].max));
        }

        if (this._validators[formControl].foundInCollection) {
            validators.push(GenericValidators.foundInCollection(this._validators[formControl].foundInCollection));
        }

        return validators;
    }

    public _handleCreate(resource: CompanySaveResource): void {
        this.create.emit(resource);
    }

    public _handleUpdate(resource: CompanySaveResource): void {
        this.update.emit(resource);
    }

    private _initForm(): void {
        if (this.mode === CaptureModeEnum.Update) {
            const hasStreetAddress = Object.keys(this._defaultValues.streetAddress || {}).length > 0;
            const hasPostBoxAddress = Object.keys(this._defaultValues.postBoxAddress || {}).length > 0;

            this.form.controls['hasStreetAddress'].setValue(hasStreetAddress);
            this.form.controls['hasPostBoxAddress'].setValue(hasPostBoxAddress);

            if (hasStreetAddress) {
                this._setValidators(this.streetAddressFormGroup);
            } else {
                this._unsetValidators(this.streetAddressFormGroup);
            }

            if (hasPostBoxAddress) {
                this._setValidators(this.postBoxAddressFormGroup);
            } else {
                this._unsetValidators(this.postBoxAddressFormGroup);
            }
        } else {
            this.form.controls['hasStreetAddress'].setValue(true);
            this.form.controls['hasPostBoxAddress'].setValue(false);

            this._setValidators(this.streetAddressFormGroup);
            this._unsetValidators(this.postBoxAddressFormGroup);
        }
    }

    private _setupForm(): void {
        this.form = this._formBuilder.group({
            name: [this._defaultValues.name, this._getValidatorsByFormControl('name')],
            hasPostBoxAddress: [''],
            postBoxAddress: this._formBuilder.group({
                postBox: [this._defaultValues.postBoxAddress?.postBox, this._getValidatorsByFormControl('postBox')],
                zipCode: [this._defaultValues.postBoxAddress?.zipCode, this._getValidatorsByFormControl('zipCode')],
                city: [this._defaultValues.postBoxAddress?.city, this._getValidatorsByFormControl('city')],
                area: [this._defaultValues.postBoxAddress?.area, this._getValidatorsByFormControl('area')],
                country: [this._defaultValues.postBoxAddress?.country, this._getValidatorsByFormControl('country')]
            }),
            hasStreetAddress: [''],
            streetAddress: this._formBuilder.group({
                street: [this._defaultValues.streetAddress?.street, this._getValidatorsByFormControl('street')],
                houseNumber: [this._defaultValues.streetAddress?.houseNumber, this._getValidatorsByFormControl('houseNumber')],
                zipCode: [this._defaultValues.streetAddress?.zipCode, this._getValidatorsByFormControl('zipCode')],
                city: [this._defaultValues.streetAddress?.city, this._getValidatorsByFormControl('city')],
                area: [this._defaultValues.streetAddress?.area, this._getValidatorsByFormControl('area')],
                country: [this._defaultValues.streetAddress?.country, this._getValidatorsByFormControl('country')]
            })
        }, {validator: this._hasAtLeastOneAddress('hasPostBoxAddress', 'hasStreetAddress')});

        this.postBoxAddressFormGroup = this.form.controls['postBoxAddress'] as UntypedFormGroup;
        this.streetAddressFormGroup = this.form.controls['streetAddress'] as UntypedFormGroup;

        this.filteredCountriesForBoxAddress = this.postBoxAddressFormGroup.controls['country'].valueChanges.pipe(
            map(value => this._filterCountries(value)),
        );

        this.filteredCountriesForStreetAddress = this.streetAddressFormGroup.controls['country'].valueChanges.pipe(
            map(value => this._filterCountries(value)),
        );

        this._initForm();
        this._setFormControlSubscriptions();
    }

    private _filterCountries(value: string): string[] {
        const searchTerm = value ? value.toLowerCase() : '';

        return ISO_3166_COUNTRIES.filter(option => option.toLowerCase().includes(searchTerm));
    }

    private _handleFormGroupValidators(state: boolean, formGroup: UntypedFormGroup): void {
        if (state) {
            this._setValidators(formGroup);
        } else {
            this._unsetValidators(formGroup);
        }
    }

    private _setValidators(formGroup: UntypedFormGroup): void {
        Object.keys(formGroup.controls).forEach(key => {
            formGroup.controls[key].setValidators(this._getValidatorsByFormControl(key));
            formGroup.controls[key].enable();
            formGroup.controls[key].updateValueAndValidity();
        });
    }

    private _unsetValidators(formGroup: UntypedFormGroup): void {
        Object.keys(formGroup.controls).forEach(key => {
            formGroup.controls[key].setValidators(null);
            formGroup.controls[key].disable();
            formGroup.controls[key].updateValueAndValidity();
        });
    }

    private _hasAtLeastOneAddress(hasPostBoxAddress: string, hasStreetAddress: string): { [key: string]: any } | null {
        return (group: UntypedFormGroup) => {
            const hasPostBoxAddressControl: AbstractControl = group.controls[hasPostBoxAddress];
            const hasStreetAddressControl: AbstractControl = group.controls[hasStreetAddress];
            return (!hasPostBoxAddressControl.value && !hasStreetAddressControl.value)
                ? {noAddress : true} : null;
        };
    }

    private _setFormControlSubscriptions(): void {
        this._disposableSubscriptions.add(
            this.form.controls['hasPostBoxAddress'].valueChanges
                .subscribe(state => this._handleFormGroupValidators(state, this.postBoxAddressFormGroup))
        );
        this._disposableSubscriptions.add(
            this.form.controls['hasStreetAddress'].valueChanges
                .subscribe(state => this._handleFormGroupValidators(state, this.streetAddressFormGroup))
        );
    }

    private _resetForm(): void {
        if (this.form) {
            this.form.reset();
            this.form.updateValueAndValidity();
        }

        this._setupForm();
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

}
