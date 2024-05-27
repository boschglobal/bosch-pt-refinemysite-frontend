/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    Inject,
    OnInit,
    Output,
    EventEmitter,
    OnDestroy
} from '@angular/core';
import {
    MAT_DIALOG_DATA,
    MatDialogRef
} from '@angular/material/dialog';
import {
    Observable,
    Subscription
} from 'rxjs';

import {RequestStatusEnum} from '../../../misc/enums/request-status.enum';

@Component({
    selector: 'ss-confirm-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit, OnDestroy {
    @Output()
    public cancel = new EventEmitter<null>();

    @Output()
    public confirm = new EventEmitter<string>();

    @Output()
    public dialogSuccess = new EventEmitter<null>();

    public canConfirm = false;

    public confirmationText = '';

    public isSubmitting = false;

    private _disposableSubscriptions = new Subscription();

    constructor(@Inject(MAT_DIALOG_DATA) public dataConfig: ConfirmationDialogDataConfig,
                public dialogRef: MatDialogRef<ConfirmationDialogComponent>) {
    }

    ngOnInit() {
        this._setSubscriptions();
        this.setCanConfirm();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    handleCancel() {
        this.cancel.emit();
    }

    handleConfirm() {
        this.isSubmitting = true;
        this.confirm.emit(this.confirmationText);
        if (this.dataConfig.closeObservable === undefined) {
            this.dialogRef.close();
        }
    }

    public setCanConfirm(): void {
        const {confirmationInputLabel, confirmationInputText} = this.dataConfig;

        this.canConfirm = !confirmationInputLabel || this.confirmationText === confirmationInputText;
    }

    private _handleCaptureState(status: RequestStatusEnum): void {
        if (status === RequestStatusEnum.Success && this.isSubmitting) {
            this.dialogSuccess.emit();
            this.cancel.emit();
        } else if (status === RequestStatusEnum.Error) {
            this.isSubmitting = false;
        }
    }

    private _setSubscriptions() {
        if (this.dataConfig.closeObservable) {
            this._disposableSubscriptions.add(
                this.dataConfig.closeObservable.subscribe((status) => this._handleCaptureState(status)));
        }
    }

    private _unsetSubscriptions() {
        this._disposableSubscriptions.unsubscribe();
    }

}

export class ConfirmationDialogDataConfig {
    titleLabel: string;
    message: string;
    confirmationButtonLabel: string;
    confirmButtonColor: string;
    cancelButtonLabel: string;
    closeObservable?: Observable<RequestStatusEnum>;
    confirmationInputLabel?: string;
    confirmationInputText?: string;
}
