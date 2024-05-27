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
    Output
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup
} from '@angular/forms';

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {GenericValidators} from '../../../../shared/misc/validation/generic.validators';
import {RfvKey} from '../../api/rfvs/resources/rfv.resource';
import {RfvEntity} from '../../entities/rfvs/rfv';

@Component({
    selector: 'ss-daycard-reason-capture',
    templateUrl: './day-card-reason-capture.component.html',
    styleUrls: ['./day-card-reason-capture.component.scss']
})
export class DayCardReasonCaptureComponent {

    @Input()
    public set dayCardReasonsRequestStatus(requestStatus: RequestStatusEnum) {
        this._handleDayCardReasonsState(requestStatus);
    }

    @Input()
    public set requestStatus(requestStatus: RequestStatusEnum) {
        this._handleCaptureState(requestStatus);
    }

    @Input()
    public dayCardReasons: RfvEntity[] = [];

    @Output()
    public submitForm: EventEmitter<RfvKey> = new EventEmitter<RfvKey>();

    @Output()
    public cancelForm: EventEmitter<void> = new EventEmitter<void>();

    public form: UntypedFormGroup;

    public isRequestingDayCardReasons = false;

    public isSubmitting = false;

    private _triggeredConfirm: boolean;

    constructor(private _formBuilder: UntypedFormBuilder) {
        this._setupForm();
    }

    public isFormValid(): boolean {
        return this.form.valid;
    }

    public handleSubmit() {
        this._triggeredConfirm = true;
        this.submitForm.emit(this.form.value.reason);
    }

    public handleCancel(): void {
        this.form.reset();
        this._triggeredConfirm = false;
        this.cancelForm.emit();
    }

    private _setupForm(): void {
        this.form = this._formBuilder.group({
            reason: ['', [GenericValidators.isRequired()]]
        });
    }

    private _handleCaptureState(requestStatus: RequestStatusEnum): void {
        this.isSubmitting = requestStatus === RequestStatusEnum.progress;

        if (requestStatus === RequestStatusEnum.success && this._triggeredConfirm) {
            this.handleCancel();
        }
    }

    private _handleDayCardReasonsState(requestStatus: RequestStatusEnum): void {
        this.isRequestingDayCardReasons = requestStatus === RequestStatusEnum.progress;

        if (requestStatus === RequestStatusEnum.error) {
            this.handleCancel();
        }
    }
}
