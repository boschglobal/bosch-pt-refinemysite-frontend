/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup
} from '@angular/forms';

import {CaptureModeEnum} from '../../../../shared/misc/enums/capture-mode.enum';
import {AttachmentHelper} from '../../../../shared/misc/helpers/attachment.helper';
import {EnvironmentHelper} from '../../../../shared/misc/helpers/environment.helper';
import {
    GenericValidators,
    ValidationMaxLength,
    ValidationMaxMinLength,
    ValidationPicture
} from '../../../../shared/misc/validation/generic.validators';
import {GenericWarnings} from '../../../../shared/misc/validation/generic.warnings';
import {SelectOption} from '../../../../shared/ui/forms/input-select-dropdown/input-select-dropdown.component';
import {ProjectParticipantResource} from '../../api/participants/resources/project-participant.resource';
import {ProjectCategoryEnumHelper} from '../../enums/project-category.enum';
import {ProjectCaptureModel} from './project-capture.model';

/**
 * Max and Min lengths for Validation
 */
const MAX_ADDRESS_CITY_LENGTH = 100;
const MAX_ADDRESS_HOUSE_NUMBER_LENGTH = 10;
const MAX_ADDRESS_STREET_LENGTH = 100;
const MAX_ADDRESS_ZIP_CODE_LENGTH = 10;
const MAX_CLIENT_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_TITLE_LENGTH = 100;
const MAX_PROJECT_NUMBER_LENGTH = 100;
const MIN_PROJECT_NUMBER_LENGTH = 1;

interface ValidationProjectCaptureAddress {
    street: ValidationMaxLength;
    houseNumber: ValidationMaxLength;
    zipCode: ValidationMaxLength;
    city: ValidationMaxLength;
}
interface ValidationProjectCapture {
    picture: ValidationPicture;
    title: ValidationMaxLength;
    description: ValidationMaxLength;
    projectNumber: ValidationMaxMinLength;
    client: ValidationMaxLength;
    address: ValidationProjectCaptureAddress;
}

@Component({
    selector: 'ss-project-capture',
    templateUrl: './project-capture.component.html',
    styleUrls: ['./project-capture.component.scss'],
})
export class ProjectCaptureComponent implements OnInit {
    /**
     * @description list of project contacts
     */
    @Input()
    public contacts: ProjectParticipantResource[] = [];

    /**
     * @description Property to define when the capture has the mode to create or edit
     */
    @Input() public mode: CaptureModeEnum;

    /**
     * @description Property that sets project capture defaultValues
     * @param defaultValues
     */
    @Input()
    public set defaultValues(defaultValues: any) {
        this._defaultValues = defaultValues;
        this._setValidations();
        this._setupForm();
        this.form.updateValueAndValidity();
    }

    /**
     * @description Property that outputs project capture resource when form is submitted
     * @type {EventEmitter<Object>}
     */
    @Output() public onSubmit: EventEmitter<ProjectCaptureModel> = new EventEmitter<ProjectCaptureModel>();

    /**
     * @description EventEmitter that emits when creation is cancelled
     * @type {EventEmitter<void>}
     */
    @Output() public onCancel: EventEmitter<void> = new EventEmitter<void>();

    /**
     * @description Property to set project capture form
     */
    public form: UntypedFormGroup;

    /**
     * @description Property with picture accepted pattern
     * @type {RegExp}
     */
    public picturePattern = new RegExp(/(image\/((jpg)|(jpeg)|(png)|(bmp)|(gif)))/i);

    /**
     * @description Property with form validations
     * @type {ValidationProjectCapture}
     */
    public validations: ValidationProjectCapture;

    /**
     * @description Property with project category list
     * @type {Array}
     */
    public categoryList: SelectOption[] = ProjectCategoryEnumHelper.getSelectOptions();

    private _defaultValues: ProjectCaptureModel = {
        picture: null,
        title: '',
        description: '',
        projectNumber: '',
        start: null,
        end: null,
        client: '',
        category: null,
        address: {
            street: '',
            houseNumber: '',
            zipCode: '',
            city: '',
        },
    };

    private _formBuilder: UntypedFormBuilder = new UntypedFormBuilder();

    constructor(private _attachmentHelper: AttachmentHelper,
                private _environmentHelper: EnvironmentHelper) {
    }

    ngOnInit() {
        this._setValidations();
        this._setupForm();
    }


    /**
     * @description Retrieve form current state
     * @returns {boolean}
     */
    public isFormValid(): boolean {
        return this.form.valid;
    }

    /**
     * @description Method called when form submission is triggered
     */
    public onSubmitForm(): void {
        const formData = {...this.form.value};
        const {start, end} = formData.range;
        delete formData.range;
        const project: ProjectCaptureModel = {
            ...formData,
            start,
            end,
        };
        this.onSubmit.emit(project);
    }

    /**
     * @description Method called when form is canceled
     */
    public onCancelForm(): void {
        this.resetForm();
        this.onCancel.emit();
    }

    /**
     * @description Triggered to reset form values and validations
     */
    public resetForm(): void {
        this.form.reset();
        this.form.updateValueAndValidity();
        this.form.controls['picture'].setValue(this._defaultValues.picture);
    }

    /**
     * @description Define project capture current mode
     * @returns {string}
     */
    public getMode(): string {
        return this.mode === CaptureModeEnum.create ? 'create' : 'update';
    }

    private _setupForm(): void {
        this.form = this._formBuilder.group({
            picture: [this._defaultValues.picture,
                [GenericValidators.isValidExtensionFile(this.validations.picture.extension),
                    GenericValidators.isValidFileSize(this.validations.picture.maxSize)]],
            title: [this._defaultValues.title,
                [GenericValidators.isRequired(),
                    GenericValidators.isMaxLength(this.validations.title.maxLength),
                    GenericWarnings.isCharLimitReached(this.validations.title.maxLength)]],
            description: [this._defaultValues.description,
                [GenericValidators.isMaxLength(this.validations.description.maxLength),
                    GenericWarnings.isCharLimitReached(this.validations.description.maxLength)]],
            projectNumber: [this._defaultValues.projectNumber,
                [GenericValidators.isRequired(),
                    GenericValidators.isMinLength(this.validations.projectNumber.minLength),
                    GenericValidators.isMaxLength(this.validations.projectNumber.maxLength),
                    GenericWarnings.isCharLimitReached(this.validations.projectNumber.maxLength)]],
            range: [{
                start: this._defaultValues.start,
                end: this._defaultValues.end,
            }, [
                GenericValidators.isValidDate(),
                GenericValidators.isRequiredRange(),
                GenericValidators.isValidRange(),
            ]],
            client: [this._defaultValues.client,
                [GenericValidators.isMaxLength(this.validations.client.maxLength),
                    GenericWarnings.isCharLimitReached(this.validations.client.maxLength)]],
            category: [this._defaultValues.category],
            address: this._formBuilder.group({
                street: [this._defaultValues.address.street,
                    [GenericValidators.isRequired(),
                        GenericValidators.isMaxLength(this.validations.address.street.maxLength),
                        GenericWarnings.isCharLimitReached(this.validations.address.street.maxLength)]],
                houseNumber: [this._defaultValues.address.houseNumber,
                    [GenericValidators.isRequired(),
                        GenericValidators.isMaxLength(this.validations.address.houseNumber.maxLength),
                        GenericWarnings.isCharLimitReached(this.validations.address.houseNumber.maxLength)]],
                zipCode: [this._defaultValues.address.zipCode,
                    [GenericValidators.isRequired(),
                        GenericValidators.isMaxLength(this.validations.address.zipCode.maxLength),
                        GenericWarnings.isCharLimitReached(this.validations.address.zipCode.maxLength)]],
                city: [this._defaultValues.address.city,
                    [GenericValidators.isRequired(),
                        GenericValidators.isMaxLength(this.validations.address.city.maxLength),
                        GenericWarnings.isCharLimitReached(this.validations.address.city.maxLength)]],
            }),
        });
    }

    private _setValidations(): void {
        const maxSizeInMb = this._environmentHelper.getConfiguration().imageUploadMaxFileSize;
        this.validations = {
            picture: {
                extension: this.picturePattern,
                maxSize: this._attachmentHelper.convertMbToBytes(maxSizeInMb),
                maxSizeInMb,
            },
            title: {
                maxLength: MAX_TITLE_LENGTH,
            },
            description: {
                maxLength: MAX_DESCRIPTION_LENGTH,
            },
            projectNumber: {
                minLength: MIN_PROJECT_NUMBER_LENGTH,
                maxLength: MAX_PROJECT_NUMBER_LENGTH,
            },
            client: {
                maxLength: MAX_CLIENT_LENGTH,
            },
            address: {
                street: {
                    maxLength: MAX_ADDRESS_STREET_LENGTH,
                },
                houseNumber: {
                    maxLength: MAX_ADDRESS_HOUSE_NUMBER_LENGTH,
                },
                zipCode: {
                    maxLength: MAX_ADDRESS_ZIP_CODE_LENGTH,
                },
                city: {
                    maxLength: MAX_ADDRESS_CITY_LENGTH,
                },
            },
        };
    }
}
