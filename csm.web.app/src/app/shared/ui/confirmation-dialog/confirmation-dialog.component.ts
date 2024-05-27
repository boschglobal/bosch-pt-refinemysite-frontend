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
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import {
    Observable,
    Subscription
} from 'rxjs';

import {RequestStatusEnum} from '../../misc/enums/request-status.enum';
import {ButtonStyle} from '../button/button.component';
import {ModalService} from '../modal/api/modal.service';

@Component({
    selector: 'ss-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent implements OnInit, OnDestroy {

    /**
     * @description Emits when the confirmation is to be closed
     * @type {EventEmitter<null>}
     */
    @Output()
    public onClose: EventEmitter<null> = new EventEmitter<null>();

    public buttonStyle: ButtonStyle = 'primary';

    public confirmation: ConfirmationDialogModel;

    public isSubmitting = false;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _triggeredConfirm: boolean;

    constructor(private _modalService: ModalService) {
    }

    ngOnInit() {
        this._setConfirmation();
        this._setButtonStyle();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleCancel(): void {
        this._triggeredConfirm = false;
        this._runCallback(this.confirmation.cancelCallback);
        this._modalService.close();
        this.onClose.emit();
    }

    public handleConfirm(): void {
        this._triggeredConfirm = true;
        this._runCallback(this.confirmation.confirmCallback);
    }

    public get cancelButtonMessage(): string {
        return this.confirmation.cancelButtonMessage || 'Generic_Cancel';
    }

    public get confirmButtonMessage(): string {
        return this.confirmation.confirmButtonMessage || 'Generic_Ok';
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this.confirmation.requestStatusObservable
                .subscribe(this._handleConfirmStatusChange.bind(this))
        );
    }

    public _setButtonStyle(): void {
        const isDestructiveAction = this.confirmation.isDestructiveAction;

        this.buttonStyle = isDestructiveAction ? 'primary-red' : 'primary';
    }

    private _setConfirmation() {
        this.confirmation = this._modalService.currentModalData;
    }

    private _handleConfirmStatusChange(requestStatus: RequestStatusEnum): void {
        this.isSubmitting = requestStatus === RequestStatusEnum.progress;

        if (this._triggeredConfirm) {
            if (requestStatus === RequestStatusEnum.success) {
                this._runCallback(this.confirmation.completeCallback);
                this.handleCancel();
            }

            if (requestStatus === RequestStatusEnum.error) {
                this.handleCancel();
            }
        }
    }

    private _runCallback(callback: Function): void {
        if (callback) {
            callback();
        }
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}

export interface ConfirmationDialogModel {
    title: string;
    description: string;
    cancelCallback?: Function;
    completeCallback?: Function;
    confirmCallback: Function;
    cancelButtonMessage?: string;
    confirmButtonMessage?: string;
    requestStatusObservable: Observable<RequestStatusEnum>;
    isDestructiveAction?: boolean;
}
