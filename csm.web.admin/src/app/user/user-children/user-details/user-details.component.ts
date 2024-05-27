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
    OnDestroy
} from '@angular/core';
import {Store} from '@ngrx/store';
import {MatDialog} from '@angular/material/dialog';
import {
    Router,
    ActivatedRoute
} from '@angular/router';
import {Subscription} from 'rxjs';

import {
    ConfirmationDialogComponent,
    ConfirmationDialogDataConfig,
} from '../../../shared/dialog/components/confirmation-dialog/confirmation-dialog.component';
import {EmployeeResource} from '../../../employee/employee-common/api/resources/employee.resource';
import {EmployeeCaptureData} from '../../../employee/employee-common/presentationals/employee-capture/employee-capture.component';
import {
    EmployeeEditDialogData,
    EmployeeEditComponent
} from '../../../employee/employee-children/employee-edit/employee-edit.component';
import {EMPLOYEE_DELETE_CONFIRM_DIALOG_CONFIG} from '../../../employee/employee-common/constants/employee-confirm-delete-dialog-config';
import {EmployeeActions} from '../../../employee/employee-common/store/employee.actions';
import {EmployeeQueries} from '../../../employee/employee-common/store/employee.queries';
import {State} from '../../../app.reducers';
import {USER_DELETE_CONFIRM_DIALOG_CONFIG} from '../../constants/user-confirm-delete-dialog-config';
import {USER_DEMOTE_ADMIN_CONFIRM_DIALOG_CONFIG} from '../../constants/user-confirm-demote-admin-dialog-config';
import {USER_LOCK_CONFIRM_DIALOG_CONFIG} from '../../constants/user-confirm-lock-dialog-config';
import {USER_PROMOTE_ADMIN_CONFIRM_DIALOG_CONFIG} from '../../constants/user-confirm-promote-admin-dialog-config';
import {USER_UNLOCK_CONFIRM_DIALOG_CONFIG} from '../../constants/user-confirm-unlock-dialog-config';
import {UserActions} from '../../store/user/user.actions';
import {UserQueries} from '../../store/user/user.queries';
import {UserResource} from '../../api/resources/user.resource';

@Component({
    selector: 'ss-user-details',
    templateUrl: './user-details.component.html',
    styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit, OnDestroy {
    constructor(private _activeRoute: ActivatedRoute,
                private _dialog: MatDialog,
                private _employeeQueries: EmployeeQueries,
                private _router: Router,
                private _store: Store<State>,
                private _userQueries: UserQueries) {
    }

    public user: UserResource;

    public employee: EmployeeResource;

    private _disposableSubscription: Subscription = new Subscription();

    ngOnInit(): void {
        this._setSubscriptions();
    }

    ngOnDestroy(): void {
        this._unsetSubscription();
    }

    public handleEditAdmin(value: boolean) {
        const {id, version} = this.user;
        const data: ConfirmationDialogDataConfig = {
            ...(value ? USER_PROMOTE_ADMIN_CONFIRM_DIALOG_CONFIG : USER_DEMOTE_ADMIN_CONFIRM_DIALOG_CONFIG),
            closeObservable: this._userQueries.observeCurrentUserRequestStatus()
        };
        const dialog = this._dialog.open(ConfirmationDialogComponent, {data});

        dialog.componentInstance.cancel.subscribe(() => dialog.close(false));
        dialog.componentInstance.confirm.subscribe(() => this._store.dispatch(new UserActions.Set.Admin(id, value, version)));
    }

    public handleEditLock(value: boolean) {
        const {id, version} = this.user;
        const data: ConfirmationDialogDataConfig = {
            ...(value ? USER_LOCK_CONFIRM_DIALOG_CONFIG : USER_UNLOCK_CONFIRM_DIALOG_CONFIG),
            closeObservable: this._userQueries.observeCurrentUserRequestStatus()
        };
        const dialog = this._dialog.open(ConfirmationDialogComponent, {data});

        dialog.componentInstance.cancel.subscribe(() => dialog.close(false));
        dialog.componentInstance.confirm.subscribe(() => this._store.dispatch(new UserActions.Set.Lock(id, value, version)));
    }

    public handleDeleteUser() {
        const data = USER_DELETE_CONFIRM_DIALOG_CONFIG;
        data.closeObservable = this._userQueries.observeCurrentUserRequestStatus();
        const dialog = this._dialog.open(ConfirmationDialogComponent, {data});
        dialog.componentInstance.cancel.subscribe(() => {
            this._store.dispatch(new UserActions.Delete.OneReset());
            dialog.close();
        });
        const {id, version} = this.user;
        dialog.componentInstance.confirm.subscribe(
            () => this._store.dispatch(new UserActions.Delete.One(id, version))
        );
        dialog.componentInstance.dialogSuccess.subscribe(() => this._router.navigate(['/management/users']));
    }

    public handleEditEmployee(employee: EmployeeResource): void {
        const defaultValues: EmployeeCaptureData = {
            user: employee.user,
            roles: employee.roles,
            company: employee.company
        };
        const data: EmployeeEditDialogData = {
            companyId: employee.company.id,
            defaultValues,
            employeeId: employee.id,
            isCompanyAssignment: false,
            version: employee.version
        };

        const dialog = this._dialog.open(EmployeeEditComponent, {data});
        dialog.componentInstance.cancel.subscribe(() => dialog.close());
    }

    public handleDeleteEmployee(employee: EmployeeResource): void {
        const data = EMPLOYEE_DELETE_CONFIRM_DIALOG_CONFIG;
        data.closeObservable = this._employeeQueries.observeCurrentEmployeeRequestStatus();
        const dialog = this._dialog.open(ConfirmationDialogComponent, {data});
        dialog.componentInstance.cancel.subscribe(() => {
            this._store.dispatch(new EmployeeActions.Delete.OneReset());
            dialog.close();
        });
        const {id, version} = employee;
        dialog.componentInstance.confirm.subscribe(() => this._store.dispatch(new EmployeeActions.Delete.One(id, version)));
    }

    public displayName(): string {
        return `${this.user.firstName} ${this.user.lastName}`;
    }

    private _setSubscriptions(): void {
        this._disposableSubscription.add(
            this._userQueries.observeCurrentUser()
                .subscribe(user => this._setUser(user))
        );

        this._disposableSubscription.add(
            this._employeeQueries.observeCurrentEmployee()
                .subscribe(employee => this._setEmployee(employee))
        );
    }

    private _setEmployee(employee: EmployeeResource) {
        this.employee = employee;
        if (!employee) {
            this._router.navigate(
                [],
                {
                    relativeTo: this._activeRoute,
                    queryParams: {employeeId: null},
                    replaceUrl: true,
                    queryParamsHandling: 'merge'
                });
        }
    }

    private _setUser(user: UserResource) {
        this.user = user;
    }

    private _unsetSubscription(): void {
        this._disposableSubscription.unsubscribe();
    }
}
