/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    OnInit,
    Output,
    EventEmitter,
    OnDestroy,
    Inject
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {first} from 'rxjs/operators';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

import {State} from '../../../app.reducers';
import {CaptureModeEnum} from '../../../shared/misc/enums/capture-mode.enum';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {CompanySaveResource} from '../../company-common/api/resources/company-save.resource';
import {CompanyResource} from '../../company-common/api/resources/company.resource';
import {CompanyActions} from '../../company-common/store/company.actions';
import {CompanyQueries} from '../../company-common/store/company.queries';

@Component({
    selector: 'ss-company-edit',
    templateUrl: './company-edit.component.html',
    styleUrls: ['./company-edit.component.scss']
})
export class CompanyEditComponent implements OnInit, OnDestroy {

    @Output()
    public cancel = new EventEmitter<null>();

    public isLoading = false;

    public mode = CaptureModeEnum.Update;

    public defaultValues: CompanySaveResource;

    private _isSubmitting: boolean;

    private _disposableSubscriptions = new Subscription();

    constructor(@Inject(MAT_DIALOG_DATA) public dataConfig: CompanyEditDialogData,
                private _companyQueries: CompanyQueries,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleUpdate(company: CompanySaveResource): void {
        this._isSubmitting = true;
        this._store.dispatch(new CompanyActions.Update.One(this.dataConfig.companyId, company, this.dataConfig.version));
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

        this._disposableSubscriptions.add(
            this._companyQueries.observeCompanyById(this.dataConfig.companyId)
                .pipe(first())
                .subscribe(company => this._setDefaultValues(company)));
    }

    private _setDefaultValues(company: CompanyResource): void {
        this.defaultValues = company;
    }

    private _handleCaptureState(requestStatus: RequestStatusEnum): void {
        if (this._isSubmitting) {
            if (requestStatus === RequestStatusEnum.Success) {
                this._store.dispatch(new CompanyActions.Update.OneReset());
                this.cancel.emit();
            }

            this.isLoading = requestStatus === RequestStatusEnum.Progress;
        }
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}

export class CompanyEditDialogData {
    companyId: string;
    version: number;
}
