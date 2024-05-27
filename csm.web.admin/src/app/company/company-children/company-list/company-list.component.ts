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
    OnInit,
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {PageEvent} from '@angular/material/paginator';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {Sort} from '@angular/material/sort';
import {Subscription} from 'rxjs';

import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {CompanyActions} from '../../company-common/store/company.actions';
import {CompanyCreateComponent} from '../company-create/company-create.component';
import {COMPANY_DELETE_CONFIRM_DIALOG_CONFIG} from '../../company-common/constants/company-confirm-delete-dialog-config';
import {
    CompanyEditComponent,
    CompanyEditDialogData
} from '../company-edit/company-edit.component';
import {CompanyFilterData} from '../../company-common/api/resources/company-filter.resource';
import {CompanyQueries} from '../../company-common/store/company.queries';
import {CompanyResource} from '../../company-common/api/resources/company.resource';
import {ConfirmationDialogComponent} from '../../../shared/dialog/components/confirmation-dialog/confirmation-dialog.component';
import {PAGE_SIZE_OPTIONS} from '../../../shared/misc/constants/pagination.constants';
import {PaginatorData} from '../../../shared/ui/paginator/paginator-data.datastructure';
import {State} from '../../../app.reducers';
import {SorterData} from '../../../shared/ui/sorter/sorter-data.datastructure';
import {SortDirectionEnum} from '../../../shared/ui/sorter/sort-direction.enum';

@Component({
    selector: 'ss-company-list',
    templateUrl: './company-list.component.html',
    styleUrls: ['./company-list.component.scss']
})
export class CompanyListComponent implements OnInit, OnDestroy, AfterViewInit {
    public displayedColumns: string[] = ['name', 'address', 'pobox', 'actions'];

    public companies = new Array<CompanyResource>();

    public paginatorData: PaginatorData = new PaginatorData();

    public companyListSizeOptions = PAGE_SIZE_OPTIONS;

    public filterData = new CompanyFilterData();

    public isLoading = false;

    public sort = new SorterData();

    private _editingCompanyId: string;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _companyQueries: CompanyQueries,
                private _dialog: MatDialog,
                private _focusMonitor: FocusMonitor,
                private _router: Router,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._setSubscriptions();
        this._requestCompanies();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
        this._store.dispatch(new CompanyActions.Initialize.Filter());
    }

    ngAfterViewInit() {
        this._stopFocusMonitoring();
    }

    public isEditingCompany(company: CompanyResource): boolean {
        return this._editingCompanyId === company.id;
    }

    public handlePaginationChange(event: PageEvent): void {
        if (event.pageIndex !== this.paginatorData.pageNumber) {
            this._setPage(event.pageIndex);
        } else if (event.pageSize !== this.paginatorData.pageSize) {
            this._setPageSize(event.pageSize);
        }
    }

    public canDelete(company: CompanyResource): boolean {
        return company._links.hasOwnProperty('delete');
    }

    public openCreateModal(): void {
        const dialog = this._dialog.open(CompanyCreateComponent);
        dialog.componentInstance.cancel.subscribe(() => dialog.close());
    }

    public openEditModal(company: CompanyResource): void {
        const data: CompanyEditDialogData = {
            companyId: company.id,
            version: company.version
        };

        const dialog = this._dialog.open(CompanyEditComponent, {
             data
        });
        dialog.componentInstance.cancel.subscribe(() => dialog.close());
    }

    public openDeleteModal(company: CompanyResource): void {
        const data = COMPANY_DELETE_CONFIRM_DIALOG_CONFIG;
        data.closeObservable = this._companyQueries.observeCurrentCompanyRequestStatus();
        const dialog = this._dialog.open(ConfirmationDialogComponent, {data});
        dialog.componentInstance.cancel.subscribe(() => {
            this._store.dispatch(new CompanyActions.Delete.OneReset());
            dialog.close();
        });
        dialog.componentInstance.confirm.subscribe(() => this._store.dispatch(new CompanyActions.Delete.One(company.id, company.version)));
    }

    public toCompanyDetails(company: CompanyResource): void {
        this._router.navigate([`/management/companies/${company.id}/detail`]);
    }

    public handleNameSearch(value: string) {
        const filters: CompanyFilterData = new CompanyFilterData();
        filters.name = value;
        this._setFilter(filters);
    }

    public handleSort({active, direction}: Sort) {
        const sorterData = new SorterData(active, direction as SortDirectionEnum);
        this._store.dispatch(new CompanyActions.Set.Sort(sorterData));
    }

    private _requestCompanies(): void {
        this._store.dispatch(new CompanyActions.Set.Page(0));
    }

    private _setPage(page: number): void {
        this._store.dispatch(new CompanyActions.Set.Page(page));
    }

    private _setPageSize(pageSize: number): void {
        this._store.dispatch(new CompanyActions.Set.PageSize(pageSize));
    }

    private _setSort(sort: SorterData): void {
        this.sort = sort;
    }

    private _setFilter(filters: CompanyFilterData) {
        this._store.dispatch(new CompanyActions.Set.Filter(filters));
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._companyQueries
                .observeCompanyList()
                .subscribe(companies => this._setCompanies(companies))
        );

        this._disposableSubscriptions.add(
            this._companyQueries
                .observeCompanyListPagination()
                .subscribe(pagination => this._setPaginationData(pagination))
        );

        this._disposableSubscriptions.add(
            this._companyQueries
                .observeCompanyListFilter()
                .subscribe(filterData => this._setFilterData(filterData))
        );

        this._disposableSubscriptions.add(
            this._companyQueries
                .observeCompanyListRequestStatus()
                .subscribe(status => this._setLoadingState(status))
        );

        this._disposableSubscriptions.add(
            this._companyQueries
                .observeCompanyListSort()
                .subscribe(sort => this._setSort(sort))
        );
    }

    private _setCompanies(companies: CompanyResource[]): void {
        this.companies = companies;
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setPaginationData(pagination: PaginatorData): void {
        this.paginatorData = pagination;
    }

    private _setFilterData(filter: CompanyFilterData): void {
        this.filterData = {...filter};
    }

    private _setLoadingState(status: RequestStatusEnum): void {
        this.isLoading = status === RequestStatusEnum.Progress;
    }

    private _stopFocusMonitoring() {
        /**
         * This code prevents Angular native monitoring from
         * applying the focused styles to the incorrect element
         */
        this._focusMonitor.stopMonitoring(document.getElementById('name'));
    }

}
