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
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup
} from '@angular/forms';
import {Store} from '@ngrx/store';
import {
    Observable,
    Subscription
} from 'rxjs';
import {State} from '../../../../app.reducers';
import {CompanyActions} from '../../../../company/company-common/store/company.actions';
import {CompanyQueries} from '../../../../company/company-common/store/company.queries';
import {ResourceReferenceWithEmail} from '../../../../shared/misc/api/datatypes/resource-reference-with-email.datatype';
import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';

import {CaptureModeEnum} from '../../../../shared/misc/enums/capture-mode.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {SelectOption} from '../../../../shared/misc/helpers/enum.helper';
import {GenericValidators} from '../../../../shared/misc/validation/generic.validators';
import {UserActions} from '../../../../user/store/user/user.actions';
import {UserQueries} from '../../../../user/store/user/user.queries';
import {
    EmployeeRoleEnum,
    employeeRolesEnumHelper
} from '../../api/resources/employee-roles.enum';
import {EmployeeQueries} from '../../store/employee.queries';

@Component({
    selector: 'ss-employee-capture',
    templateUrl: './employee-capture.component.html',
    styleUrls: ['./employee-capture.component.scss']
})
export class EmployeeCaptureComponent implements OnInit, OnDestroy {
    /**
     * @description Property to define when the capture has the mode to create or edit
     */
    @Input()
    public set defaultValues(defaultValues: EmployeeCaptureData) {
        this._defaultValues = defaultValues;
        this._resetForm();
    }
    /**
     * @description Property to define when the capture has the mode to create or edit
     */
    @Input()
    public mode: CaptureModeEnum;

    /**
     * @description Property to define if we are assigning a company or not
     */
    @Input()
    public isCompanyAssignment = false;

    /**
     * @description Emits when the form is to be submitted to create a new employee
     * @type {EventEmitter<EmployeeFormData>}
     */
    @Output()
    public create: EventEmitter<EmployeeFormData> = new EventEmitter<EmployeeFormData>();

    /**
     * @description Emits when the form is to be submitted to update a new employee
     * @type {EventEmitter<EmployeeFormData>}
     */
    @Output()
    public update: EventEmitter<EmployeeFormData> = new EventEmitter<EmployeeFormData>();

    /**
     * @description Emits when the dialog is should be closed
     * @type {EventEmitter<null>}
     */
    @Output()
    public cancel: EventEmitter<null> = new EventEmitter();
    /**
     * @description Initialize form create
     */

    /**
     * @description Roles available in the role selection
     */
    public roleOptions: SelectOption[] = employeeRolesEnumHelper.getSelectOptions();

    public form: UntypedFormGroup;

    public filteredOptions: Observable<ResourceReferenceWithEmail[]>;

    public filteredCompaniesOptions: Observable<ResourceReference[]>;

    public isSubmitting = false;

    /**
     * @description Store subscriptions
     */
    private _disposableSubscriptions: Subscription = new Subscription();

    /**
     * @description Default form values
     */
    private _defaultValues: EmployeeCaptureData = {} as EmployeeCaptureData;

    constructor(private _companyQueries: CompanyQueries,
                private _employeeQueries: EmployeeQueries,
                private _formBuilder: UntypedFormBuilder,
                private _store: Store<State>,
                private _userQueries: UserQueries) {
    }

    ngOnInit(): void {
        this._setupForm();
        this.filteredOptions = this._userQueries.observeUserSuggestions();
        this.filteredCompaniesOptions = this._companyQueries.observeCompanySuggestions();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscription();
    }

    public handleSubmit(): void {
        const result = this._getResourceFromForm();
        this.isSubmitting = true;

        if (this.isUpdateMode()) {
            this.update.emit(result);
        } else {
            this.create.emit(result);
        }
    }

    public handleCancel(): void {
        this.cancel.emit();
        this._resetForm();
    }

    public isUpdateMode(): boolean {
        return this.mode === CaptureModeEnum.Update;
    }

    public updateUserAutocomplete(search: string | ResourceReferenceWithEmail): void {
        if (search) {
            const filterValue: string = typeof search === 'string' ? search : search.displayName;
            this._store.dispatch(new UserActions.Request.RequestSuggestions(filterValue.toLowerCase()));
        } else {
            this._store.dispatch(new UserActions.Request.RequestSuggestions(''));
        }
    }

    public updateCompanyAutocomplete(search: string | ResourceReference): void {
        if (search) {
            const filterValue: string = typeof search === 'string' ? search : search.displayName;
            this._store.dispatch(new CompanyActions.Request.RequestSuggestions(filterValue.toLowerCase()));
        } else {
            this._store.dispatch(new CompanyActions.Request.RequestSuggestions(''));
        }
    }

    public displayUserData(resource: ResourceReferenceWithEmail): string {
        if (resource) {
            return `${resource.displayName} - ${resource.email}`;
        }
    }

    public displayCompanyData(resource: ResourceReference): string {
        return resource?.displayName || '';
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._employeeQueries.observeCurrentEmployeeRequestStatus()
                .subscribe(requestStatus => this._handleRequestStatus(requestStatus))
        );
    }

    private _unsetSubscription(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setupForm(): void {
        const formConfigs = Object.assign({}, {
            user:  [
                {value : this._defaultValues.user, disabled: (this.isUpdateMode() || this.isCompanyAssignment)},
                [GenericValidators.isRequired(), GenericValidators.isObjectWithKey('id')]
            ],
            roles: [this._defaultValues.roles, [GenericValidators.isRequired()]],
            company: [
                {value: this._defaultValues.company, disabled: this._isCompanyDisabled()},
                [GenericValidators.isRequired(), GenericValidators.isObjectWithKey('id')]
            ]
        });

        this.form = this._formBuilder.group(formConfigs);
        this._setFormControlSubscriptions();
    }

    private _isCompanyDisabled(): boolean {
        return !this.isCompanyAssignment;
    }

    private _setFormControlSubscriptions(): void {
        this._disposableSubscriptions.add(
            this.form.controls['user'].valueChanges
                .subscribe(state => this.updateUserAutocomplete(state))
        );

        this._disposableSubscriptions.add(
            this.form.controls['company'].valueChanges
                .subscribe(state => this.updateCompanyAutocomplete(state))
        );
    }

    private _resetForm(): void {
        if (this.form) {
            this.form.reset();
            this.form.updateValueAndValidity();
        }
        this._setupForm();
    }

    private _getResourceFromForm(): EmployeeFormData {
        return Object.assign({}, {
            userId: this.form.get('user').value.id,
            roles: this.form.get('roles').value,
            companyId: this.form.get('company').value.id
        });
    }

    private _handleRequestStatus(requestStatus: RequestStatusEnum) {
        this.isSubmitting = requestStatus === RequestStatusEnum.Progress;
    }
}

export class EmployeeCaptureData {
    user: ResourceReferenceWithEmail;
    roles: EmployeeRoleEnum[];
    company?: ResourceReference;
    constructor(user, roles, company) {
        this.user = user;
        this.roles = roles;
        this.company = company;
    }
}

export class EmployeeFormData {
    userId: string;
    roles: EmployeeRoleEnum[];
    companyId?: string;
    constructor(userId: string, roles: EmployeeRoleEnum[], companyId?: string) {
        this.userId = userId;
        this.roles = roles;
        this.companyId = companyId;
    }
}
