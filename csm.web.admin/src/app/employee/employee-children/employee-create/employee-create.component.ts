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
    Inject,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {State} from '../../../app.reducers';

import {CaptureModeEnum} from '../../../shared/misc/enums/capture-mode.enum';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {EmployableUserQueries} from '../../../user/store/employable-user/employable-user.queries';
import {
    EmployeeCaptureData,
    EmployeeFormData
} from '../../employee-common/presentationals/employee-capture/employee-capture.component';
import {EmployeeActions} from '../../employee-common/store/employee.actions';
import {EmployeeQueries} from '../../employee-common/store/employee.queries';

@Component({
    selector: 'ss-employee-create',
    templateUrl: './employee-create.component.html',
    styleUrls: ['./employee-create.component.scss']
})
export class EmployeeCreateComponent implements OnInit, OnDestroy {
    @Output()
    public cancel = new EventEmitter<null>();

    public isLoading = false;

    public mode = CaptureModeEnum.Create;

    private _isSubmitting: boolean;

    private _disposableSubscriptions = new Subscription();

    constructor(@Inject(MAT_DIALOG_DATA) public dataConfig: EmployeeCreateDialogData,
                private _employeeQueries: EmployeeQueries,
                private _employableUserQueries: EmployableUserQueries,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleCreate(captureResult: EmployeeFormData): void {
        this._isSubmitting = true;
        this._store.dispatch(new EmployeeActions.Create.One(captureResult.companyId, captureResult));
    }

    public handleCancel(): void {
        this._isSubmitting = false;
        this.cancel.emit();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._employeeQueries.observeCurrentEmployeeRequestStatus()
                .subscribe(requestStatus => this._handleCaptureState(requestStatus))
        );
    }

    private _handleCaptureState(requestStatus: RequestStatusEnum): void {
        if (this._isSubmitting) {
            if (requestStatus === RequestStatusEnum.Success) {
                this._store.dispatch(new EmployeeActions.Create.OneReset());
                this.cancel.emit();
            }
            this.isLoading = requestStatus === RequestStatusEnum.Progress;
        }
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}

export class EmployeeCreateDialogData {
    defaultValues: EmployeeCaptureData;
    isCompanyAssignment: boolean;
}
