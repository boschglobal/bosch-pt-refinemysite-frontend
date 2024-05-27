/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {FocusMonitor} from '@angular/cdk/a11y';
import {
    AfterViewInit,
    Component,
    OnDestroy,
    OnInit
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {PageEvent} from '@angular/material/paginator';
import {Sort} from '@angular/material/sort';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {take} from 'rxjs/operators';

import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {EmployableUserActions} from '../../store/employable-user/employable-user.actions';
import {EmployableUserFilter} from '../../api/resources/employable-user-filter.resource';
import {EmployableUserQueries} from '../../store/employable-user/employable-user.queries';
import {EmployableUserResource} from '../../api/resources/employable-user.resource';
import {EmployeeActions} from '../../../employee/employee-common/store/employee.actions';
import {EmployeeCaptureData} from '../../../employee/employee-common/presentationals/employee-capture/employee-capture.component';
import {
    EmployeeCreateComponent,
    EmployeeCreateDialogData
} from '../../../employee/employee-children/employee-create/employee-create.component';
import {
    EmployeeEditComponent,
    EmployeeEditDialogData
} from '../../../employee/employee-children/employee-edit/employee-edit.component';
import {EmployeeQueries} from '../../../employee/employee-common/store/employee.queries';
import {EmployeeResource} from '../../../employee/employee-common/api/resources/employee.resource';
import {PAGE_SIZE_OPTIONS} from '../../../shared/misc/constants/pagination.constants';
import {PaginatorData} from '../../../shared/ui/paginator/paginator-data.datastructure';
import {ResourceReference} from '../../../shared/misc/api/datatypes/resource-reference.datatype';
import {SortDirectionEnum} from '../../../shared/ui/sorter/sort-direction.enum';
import {SorterData} from '../../../shared/ui/sorter/sorter-data.datastructure';
import {State} from '../../../app.reducers';

@Component({
    selector: 'ss-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy, AfterViewInit {

    public displayedColumns: string[] = ['name', 'email', 'company', 'createdAt', 'actions'];

    public employableUsers = new Array<EmployableUserResource>();

    public paginatorData: PaginatorData = new PaginatorData();

    public userListSizeOptions = PAGE_SIZE_OPTIONS;

    public filterData = new EmployableUserFilter();

    public sort = new SorterData();

    public isLoading = false;

    public userSearchFilterEnum = UserSearchFilterEnum;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _currentEmployee: EmployeeResource;

    private _employableUser: EmployableUserResource;

    constructor(private _dialog: MatDialog,
                private _employableUserQueries: EmployableUserQueries,
                private _employeeQueries: EmployeeQueries,
                private _focusMonitor: FocusMonitor,
                private _router: Router,
                private _store: Store<State>) {
    }

    ngOnInit(): void {
        this._setSubscriptions();
        this._requestUsers();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
        this._store.dispatch(new EmployableUserActions.Initialize.Filter());
    }

    ngAfterViewInit() {
        this._stopFocusMonitoring();
    }

    public handleAddEmployableUser(employableUser: EmployableUserResource): void {
        const data: EmployeeCreateDialogData = {
            defaultValues: {
                user: employableUser.user,
                roles: [],
                company: {} as ResourceReference
            },
            isCompanyAssignment: true
        };

        const dialog = this._dialog.open(EmployeeCreateComponent, {data});
        dialog.componentInstance.cancel.subscribe(() => dialog.close());
        dialog.afterClosed().subscribe(() => {
            this._requestUsers();
        });
    }

    public handleEditEmployableUser(): void {
        const defaultValues: EmployeeCaptureData = {
            user: this._employableUser.user,
            roles: this._currentEmployee.roles,
            company: this._employableUser.company
        };
        const data: EmployeeEditDialogData = {
            companyId: this._employableUser.company.id,
            employeeId: this._employableUser.employee.id,
            version: this._currentEmployee.version,
            defaultValues,
            isCompanyAssignment: false
        };

        const dialog = this._dialog.open(EmployeeEditComponent, {data});
        dialog.componentInstance.cancel.subscribe(() => dialog.close());
        dialog.afterClosed().subscribe(() => {
            this._currentEmployee = {} as EmployeeResource;
            this._employableUser = {} as EmployableUserResource;
            this._requestUsers();
        });
    }

    public handleEditDialogOpen(employableUser: EmployableUserResource) {
        this._store.dispatch(new EmployeeActions.Set.Current(employableUser.employee.id));
        this._employableUser = employableUser;
        this._fetchEmployee(this._employableUser.employee.id);
    }

    public handleSearch(key: UserSearchFilterEnum, value: string) {
        const filters: EmployableUserFilter = {...this.filterData};
        filters[key] = value;
        this._setFilter(filters);
    }

    public handleSort({active, direction}: Sort) {
        const sorterData = new SorterData(active, direction as SortDirectionEnum);
        this._store.dispatch(new EmployableUserActions.Set.Sort(sorterData));
    }

    public toUserDetails(employableUser: EmployableUserResource) {
        const uri = [`/management/users/${employableUser.user.id}`];
        let extras;
        if (employableUser.employee) {
            extras = Object.assign({}, {queryParams: {employeeId: employableUser.employee.id}});
        }
        this._router.navigate(uri, extras);
    }

    public handlePaginationChange(event: PageEvent): void {
        if (event.pageIndex !== this.paginatorData.pageNumber) {
            this._setPage(event.pageIndex);
        } else if (event.pageSize !== this.paginatorData.pageSize) {
            this._setPageSize(event.pageSize);
        }
    }

    public canCreate(employableUser: EmployableUserResource): boolean {
        return employableUser._links.hasOwnProperty('createEmployee');
    }

    public canEdit(employableUser: EmployableUserResource): boolean {
        return employableUser._links.hasOwnProperty('editEmployee');
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._employableUserQueries
                .observeEmployableUsersList()
                .subscribe(users => this._setUsers(users))
        );

        this._disposableSubscriptions.add(
            this._employableUserQueries
                .observeEmployableUsersListPagination()
                .subscribe(pagination => this._setPaginationData(pagination))
        );

        this._disposableSubscriptions.add(
            this._employableUserQueries
                .observeEmployableUserListFilter()
                .subscribe(filterData => this._setFilterData(filterData))
        );

        this._disposableSubscriptions.add(
            this._employableUserQueries
                .observeEmployableUserListSort()
                .subscribe(sort => this._setSort(sort))
        );

        this._disposableSubscriptions.add(
            this._employableUserQueries
                .observeEmployableUsersListRequestStatus()
                .subscribe(status => this._setLoadingState(status))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _requestUsers(): void {
        this._store.dispatch(new EmployableUserActions.Set.Page(0));
    }

    private _fetchEmployee(id: string): void {
        this._employeeQueries.observeEmployeeById(id)
            .subscribe(employee => {
                if (employee) {
                    this._setCurrentEmployee(employee);
                    this.handleEditEmployableUser();
                } else {
                    this._store.dispatch(new EmployeeActions.Request.One(id));
                    this._employeeQueries.observeCurrentEmployee()
                        .pipe(take(2))
                        .subscribe(resource => {
                            if (resource) {
                                this._setCurrentEmployee(resource);
                                this.handleEditEmployableUser();
                            }
                        });
                }
            })
            .unsubscribe();
    }

    private _setPage(page: number): void {
        this._store.dispatch(new EmployableUserActions.Set.Page(page));
    }

    private _setPageSize(pageSize: number): void {
        this._store.dispatch(new EmployableUserActions.Set.PageSize(pageSize));
    }

    private _setFilter(filters: EmployableUserFilter): void {
        this._store.dispatch(new EmployableUserActions.Set.Filter(filters));
    }

    private _setPaginationData(pagination: PaginatorData): void {
        this.paginatorData = pagination;
    }

    private _setFilterData(filter: EmployableUserFilter): void {
        this.filterData = {...filter};
    }

    private _setSort(sort: SorterData): void {
        this.sort = sort;
    }

    private _setUsers(employableUsers: EmployableUserResource[]): void {
        this.employableUsers = employableUsers;
    }

    private _setCurrentEmployee(employee: EmployeeResource): void {
        this._currentEmployee = employee;
    }

    private _setLoadingState(status: RequestStatusEnum): void {
        this.isLoading = status === RequestStatusEnum.Progress;
    }

    private _stopFocusMonitoring() {
        /**
         * This code prevents Angular native monitoring from
         * applying the focused styles to the incorrect element
         */
        this._focusMonitor.stopMonitoring(document.getElementById('userName'));
        this._focusMonitor.stopMonitoring(document.getElementById('email'));
        this._focusMonitor.stopMonitoring(document.getElementById('company'));
    }
}

export enum UserSearchFilterEnum {
    Name = 'name',
    CompanyName = 'companyName',
    Email = 'email'
}
