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
    Inject,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

import {CaptureModeEnum} from '../../../shared/misc/enums/capture-mode.enum';
import {EmployeeActions} from '../../employee-common/store/employee.actions';
import {
    EmployeeCaptureData,
    EmployeeFormData
} from '../../employee-common/presentationals/employee-capture/employee-capture.component';
import {EmployeeQueries} from '../../employee-common/store/employee.queries';
import {EmployeeSaveResource} from '../../employee-common/api/resources/employee-save.resource';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {State} from '../../../app.reducers';

@Component({
    selector: 'ss-employee-edit',
    templateUrl: './employee-edit.component.html',
    styleUrls: ['./employee-edit.component.scss']
})

export class EmployeeEditComponent implements OnInit, OnDestroy {
    @Output()
    public cancel = new EventEmitter<null>();

    public isLoading = false;

    public mode = CaptureModeEnum.Update;

    private _isSubmitting: boolean;

    private _disposableSubscriptions = new Subscription();

    constructor(@Inject(MAT_DIALOG_DATA) public dataConfig: EmployeeEditDialogData,
                private _employeeQueries: EmployeeQueries,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleUpdate(employee: EmployeeFormData): void {
        this._isSubmitting = true;
        this._store.dispatch(new EmployeeActions.Update.One(this.dataConfig.employeeId, employee, this.dataConfig.version));
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
                this.cancel.emit();
            }
            this.isLoading = requestStatus === RequestStatusEnum.Progress;
        }
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}

export class EmployeeEditDialogData {
    isCompanyAssignment: boolean;
    companyId: string;
    employeeId: string;
    version: number;
    defaultValues: EmployeeCaptureData;
}
