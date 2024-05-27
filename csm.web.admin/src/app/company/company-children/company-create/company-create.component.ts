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
    Output,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {State} from '../../../app.reducers';
import {CaptureModeEnum} from '../../../shared/misc/enums/capture-mode.enum';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {CompanySaveResource} from '../../company-common/api/resources/company-save.resource';
import {CompanyActions} from '../../company-common/store/company.actions';
import {CompanyQueries} from '../../company-common/store/company.queries';

@Component({
    selector: 'ss-company-create',
    templateUrl: './company-create.component.html',
    styleUrls: ['./company-create.component.scss']
})
export class CompanyCreateComponent implements OnInit, OnDestroy {

    @Output()
    public cancel = new EventEmitter<null>();

    public isLoading = false;

    public mode = CaptureModeEnum.Create;

    private _isSubmitting: boolean;

    private _disposableSubscriptions = new Subscription();

    constructor(private _companyQueries: CompanyQueries,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleCreate(company: CompanySaveResource): void {
        this._isSubmitting = true;
        this._store.dispatch(new CompanyActions.Create.One(company));
    }

    public handleCancel(): void {
        this._isSubmitting = false;
        this.cancel.emit();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._companyQueries.observeCurrentCompanyRequestStatus()
                .subscribe(requestStatus => this._handleCaptureState(requestStatus))
        );
    }

    private _handleCaptureState(requestStatus: RequestStatusEnum): void {
        if (this._isSubmitting) {
            if (requestStatus === RequestStatusEnum.Success) {
                this._store.dispatch(new CompanyActions.Create.OneReset());
                this.cancel.emit();
            }

            this.isLoading = requestStatus === RequestStatusEnum.Progress;
        }
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
