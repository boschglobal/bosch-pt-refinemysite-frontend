/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    Component,
    OnDestroy,
    OnInit,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {
    filter,
    take,
} from 'rxjs/operators';

import {ModalIdEnum} from '../../../../shared/misc/enums/modal-id.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {LegalDocumentResource} from '../../../api/resources/user-legal-documents.resource';
import {LegalDocumentsActions} from '../../../store/legal-documents/legal-documents.actions';
import {LegalDocumentsQueries} from '../../../store/legal-documents/legal-documents.queries';
import {UserQueries} from '../../../store/user/user.queries';

@Component({
    selector: 'ss-legal-documents-modal',
    templateUrl: './legal-documents-modal.component.html',
})
export class LegalDocumentsModalComponent implements OnInit, OnDestroy {

    public isLoading = false;

    public legalDocuments: LegalDocumentResource[];

    public legalDocumentsModalId = ModalIdEnum.LegalDocuments;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _isSubmitting = false;

    constructor(private _legalDocumentsQueries: LegalDocumentsQueries,
                private _modalService: ModalService,
                private _store: Store,
                private _userQueries: UserQueries) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleAccept(ids: string[]): void {
        this._isSubmitting = true;

        this._store.dispatch(new LegalDocumentsActions.Consent.All(ids));
    }

    public handleDelay(): void {
        this._isSubmitting = true;

        this._store.dispatch(new LegalDocumentsActions.Consent.Delay());
    }

    private _handleLegalDocuments(legalDocuments: LegalDocumentResource[]): void {
        this.legalDocuments = legalDocuments;

        this._modalService.open({
            id: ModalIdEnum.LegalDocuments,
            data: null,
        });
    }

    private _handleRequestStatus(requestStatus: RequestStatusEnum): void {
        if (this._isSubmitting) {
            this.isLoading = requestStatus === RequestStatusEnum.progress;

            if (requestStatus === RequestStatusEnum.success) {
                this._modalService.close();
            }
        }
    }

    private _requestLegalDocuments(): void {
        this._store.dispatch(new LegalDocumentsActions.Request.All());
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._userQueries.observeCurrentUser()
                .pipe(
                    filter(user => !!user),
                    take(1),
                )
                .subscribe(() => this._requestLegalDocuments())
        );

        this._disposableSubscriptions.add(
            this._legalDocumentsQueries.observeLegalDocumentsListToConsent()
                .subscribe(legalDocuments => this._handleLegalDocuments(legalDocuments))
        );

        this._disposableSubscriptions.add(
            this._legalDocumentsQueries.observeLegalDocumentsRequestStatus()
                .subscribe(requestStatus => this._handleRequestStatus(requestStatus))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
