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
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup,
} from '@angular/forms';
import {Subscription} from 'rxjs';

import {CaptureModeEnum} from '../../../../shared/misc/enums/capture-mode.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {GenericValidators} from '../../../../shared/misc/validation/generic.validators';
import {FeatureFormResource} from '../../api/resources/feature-form.resource';
import {FeatureStateEnum} from '../../api/resources/feature.resource';
import {FeatureQueries} from '../../store/feature.queries';

@Component({
    selector: 'ss-feature-capture',
    templateUrl: './feature-capture.component.html',
    styleUrls: ['./feature-capture.component.scss']
})
export class FeatureCaptureComponent implements OnInit, OnDestroy {

    /**
     * @description Emits when the form is to be submitted to create a new feature
     * @type {EventEmitter<string>}
     */
    @Output()
    public create: EventEmitter<string> = new EventEmitter<string>();
    /**
     * @description Emits when the form is to be submitted to update a new feature
     * @type {EventEmitter<string>}
     */
    @Output()
    public update: EventEmitter<FeatureFormResource> = new EventEmitter<FeatureFormResource>();
    /**
     * @description Emits when the dialog should be closed
     * @type {EventEmitter<null>}
     */
    @Output()
    public cancel: EventEmitter<null> = new EventEmitter();
    /**
     * @description Initialize form
     */
    public form: UntypedFormGroup;
    public isSubmitting = false;
    public isCreating = false;
    public statusList = Object.entries(FeatureStateEnum);
    /**
     * @description Store subscriptions
     */
    private _disposableSubscriptions: Subscription = new Subscription();
    /**
     * @description Validators
     */
    private _validators: { [key: string]: { [key: string]: any } } = {
        name: {
            isRequired: true,
            maxLength: 100
        },
        status: {
            isRequired: true,
        }
    };

    constructor(private _featureQueries: FeatureQueries,
                private _formBuilder: UntypedFormBuilder) {
    }

    /**
     * @description Default form values
     */
    private _defaultValues = {name: '', status: FeatureStateEnum.DISABLED};

    /**
     * @description Property to define default values
     */
    @Input()
    public set defaultValues(defaultValues: FeatureFormResource) {
        this._defaultValues = defaultValues;
        this._resetForm();
    }

    private _mode: CaptureModeEnum;

    /**
     * @description Property to define when the capture has the mode to create or edit
     */
    @Input()
    public set mode(mode: CaptureModeEnum) {
        this._mode = mode;
        this.isCreating = this._mode === CaptureModeEnum.Create;
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
        const {name, status} = this.form.getRawValue();

        if (this._mode === CaptureModeEnum.Create) {
            this._handleCreate(name);
        } else {
            this._handleUpdate({name, status} as FeatureFormResource);
        }
    }

    public handleCancel(): void {
        this.cancel.emit();
        this._resetForm();
    }

    private _handleCreate(name: string): void {
        this.create.emit(name);
    }

    private _handleUpdate(feature: FeatureFormResource): void {
        this.update.emit(feature);
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._featureQueries.observeCurrentFeatureRequestStatus()
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

        return validators;
    }

    private _setupForm(): void {
        this.form = this._formBuilder.group({
            name: [this._defaultValues.name, this._getValidatorsByFormControl('name')],
            status: [this._defaultValues.status, this._getValidatorsByFormControl('status')]
        });
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
