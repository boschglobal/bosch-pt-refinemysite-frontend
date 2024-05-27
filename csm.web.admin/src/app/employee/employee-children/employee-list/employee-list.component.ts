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
import {MatDialog} from '@angular/material/dialog';
import {MatTableDataSource} from '@angular/material/table';
import {PageEvent} from '@angular/material/paginator';
import {Store} from '@ngrx/store';
import {Sort} from '@angular/material/sort';
import {Subscription} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';

import {CompanyResource} from '../../../company/company-common/api/resources/company.resource';
import {CompanyQueries} from '../../../company/company-common/store/company.queries';
import {ConfirmationDialogComponent} from '../../../shared/dialog/components/confirmation-dialog/confirmation-dialog.component';
import {EMPLOYEE_DELETE_CONFIRM_DIALOG_CONFIG} from '../../employee-common/constants/employee-confirm-delete-dialog-config';
import {EmployeeActions} from '../../employee-common/store/employee.actions';
import {EmployeeCaptureData} from '../../employee-common/presentationals/employee-capture/employee-capture.component';
import {
    EmployeeCreateComponent,
    EmployeeCreateDialogData
} from '../employee-create/employee-create.component';
import {
    EmployeeEditComponent,
    EmployeeEditDialogData
} from '../employee-edit/employee-edit.component';
import {EmployeeQueries} from '../../employee-common/store/employee.queries';
import {EmployeeResource} from '../../employee-common/api/resources/employee.resource';
import {PAGE_SIZE_OPTIONS} from 'src/app/shared/misc/constants/pagination.constants';
import {PaginatorData} from '../../../shared/ui/paginator/paginator-data.datastructure';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {State} from '../../../app.reducers';
import {SorterData} from '../../../shared/ui/sorter/sorter-data.datastructure';
import {sortDirectionEnumHelper} from '../../../shared/ui/sorter/sort-direction.enum';

@Component({
    selector: 'ss-employee-list',
    templateUrl: './employee-list.component.html',
    styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit, OnDestroy {

    public pageSizeOptions = PAGE_SIZE_OPTIONS;

    public paginatorData: PaginatorData = new PaginatorData();

    public displayedColumns = [
        'name',
        'email',
        'roles',
        'actions'
    ];

    public dataSource = new MatTableDataSource<EmployeeResource>();

    public isLoading = false;

    private _company: CompanyResource;

    private _disposableSubscription: Subscription = new Subscription();

    ngOnInit(): void {
        this._setSubscriptions();
        this._requestEmployees();
    }

    ngOnDestroy(): void {
        this._unsetSubscription();
    }

    constructor(private _companyQueries: CompanyQueries,
                private _dialog: MatDialog,
                private _employeeQueries: EmployeeQueries,
                private _store: Store<State>) {
    }

    public handleAddEmployee(): void {
        const data: EmployeeCreateDialogData = {
            defaultValues: {
                user: undefined,
                roles: undefined,
                company: {id: this._company.id, displayName: this._company.name}
            },
            isCompanyAssignment: false
        };

        const dialog = this._dialog.open(EmployeeCreateComponent, {data});
        dialog.componentInstance.cancel.subscribe(() => dialog.close());
    }

    public handleEditEmployee(employee: EmployeeResource): void {
        const {user, roles} = employee;

        const defaultValues: EmployeeCaptureData = {
            user,
            roles,
            company: {id: this._company.id, displayName: this._company.name}
        };

        const data: EmployeeEditDialogData = {
            companyId: this._company.id,
            defaultValues,
            employeeId: employee.id,
            isCompanyAssignment: false,
            version: employee.version
        };

        const dialog = this._dialog.open(EmployeeEditComponent, {data});
        dialog.componentInstance.cancel.subscribe(() => dialog.close());
    }

    public handleRemoveEmployee(employee: EmployeeResource): void {
        const dialogData = EMPLOYEE_DELETE_CONFIRM_DIALOG_CONFIG;
        dialogData.closeObservable = this._employeeQueries.observeCurrentEmployeeRequestStatus();
        const dialog = this._dialog.open(ConfirmationDialogComponent, {data: dialogData});
        dialog.componentInstance.cancel.subscribe(() => {
            this._store.dispatch(new EmployeeActions.Delete.OneReset());
            dialog.close();
        });
        const {id, version} = employee;
        dialog.componentInstance.confirm.subscribe(() => this._store.dispatch(new EmployeeActions.Delete.One(id, version)));
    }

    public updatePagination(page: PageEvent): void {
        if (page.pageIndex !== this.paginatorData.pageNumber) {
            this._store.dispatch(new EmployeeActions.Set.Page(page.pageIndex));
        } else if (page.pageSize !== this.paginatorData.pageSize) {
            this._store.dispatch(new EmployeeActions.Set.Items(page.pageSize));
        }
    }

    public canDelete(employee: EmployeeResource): boolean {
        return employee._links.hasOwnProperty('delete');
    }

    public sortData(sort: Sort): void {
        const sortObj = new SorterData(sort.active, sortDirectionEnumHelper.getKeyByValue(sort.direction));
        this._store.dispatch(new EmployeeActions.Set.Sort(sortObj));
    }

    private _requestEmployees(): void {
        this._store.dispatch(new EmployeeActions.Set.Page(0));
    }

    private _setSubscriptions(): void {
        this._disposableSubscription.add(
            this._employeeQueries.observeEmployeesList()
                .subscribe(result => this._setListData(result))
        );

        this._disposableSubscription.add(
            this._employeeQueries.observeEmployeeListPagination()
                .subscribe(pagination => this._setPagination(pagination))
        );

        this._disposableSubscription.add(
            this._employeeQueries.observeEmployeesListRequestStatus()
                .subscribe(status => this._setLoadingState(status))
        );

        this._disposableSubscription.add(
            this._companyQueries.observeCurrentCompany()
                .subscribe(company => this._company = company)
        );
    }

    private _unsetSubscription(): void {
        this._disposableSubscription.unsubscribe();
    }

    private _setListData(data: EmployeeResource[]): void {
        this.dataSource = new MatTableDataSource<EmployeeResource>(data);
    }

    private _setPagination(pagination: PaginatorData): void {
        this.paginatorData = pagination;
    }

    private _setLoadingState(status: RequestStatusEnum): void {
        this.isLoading = status === RequestStatusEnum.Progress;
    }
}
