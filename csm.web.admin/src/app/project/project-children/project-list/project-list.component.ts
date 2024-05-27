/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    Component,
    OnDestroy,
    OnInit,
} from '@angular/core';
import {PageEvent} from '@angular/material/paginator';
import {Sort} from '@angular/material/sort';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {State} from '../../../app.reducers';
import {PAGE_SIZE_OPTIONS} from '../../../shared/misc/constants/pagination.constants';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {PaginatorData} from '../../../shared/ui/paginator/paginator-data.datastructure';
import {SortDirectionEnum} from '../../../shared/ui/sorter/sort-direction.enum';
import {SorterData} from '../../../shared/ui/sorter/sorter-data.datastructure';
import {ProjectFiltersResource} from '../../project-common/api/resources/project-filters.resource';
import {ProjectResource} from '../../project-common/api/resources/project.resource';
import {ProjectActions} from '../../project-common/store/project.actions';
import {ProjectQueries} from '../../project-common/store/project.queries';

@Component({
    selector: 'ss-project-list',
    templateUrl: './project-list.component.html',
    styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit, OnDestroy {

    public displayedColumns: string[] = ['title', 'creator', 'company', 'createdDate'];

    public filters = new ProjectFiltersResource();

    public isLoading = false;

    public paginator = new PaginatorData();

    public pageSizeOptions = PAGE_SIZE_OPTIONS;

    public projects: ProjectResource[] = [];

    public sort = new SorterData();

    private _disposableSubscriptions = new Subscription();

    constructor(private _projectQueries: ProjectQueries,
                private _router: Router,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._setSubscriptions();
        this._handlePageChange(0);
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
        this._store.dispatch(new ProjectActions.Initialize.Filters());
    }

    public handleFiltersChange() {
        this._store.dispatch(new ProjectActions.Set.Filters(this.filters));
    }

    public handlePaginationChange(event: PageEvent): void {
        const {pageNumber, pageSize} = this.paginator;

        if (event.pageIndex !== pageNumber) {
            this._handlePageChange(event.pageIndex);
        }

        if (event.pageSize !== pageSize) {
            this._handlePageSizeChange(event.pageSize);
        }
    }

    public handleSortChange({active, direction}: Sort) {
        const sorterData = new SorterData(active, direction as SortDirectionEnum);

        this._store.dispatch(new ProjectActions.Set.Sort(sorterData));
    }

    public navigateToProjectDetails({id}: ProjectResource): void {
        this._router.navigate([`/management/projects/${id}`]);
    }

    private _handlePageChange(page: number): void {
        this._store.dispatch(new ProjectActions.Set.Page(page));
    }

    private _handlePageSizeChange(pageSize: number): void {
        this._store.dispatch(new ProjectActions.Set.PageSize(pageSize));
    }

    private _setFilters(filter: ProjectFiltersResource): void {
        this.filters = {...filter};
    }

    private _setLoadingState(status: RequestStatusEnum): void {
        this.isLoading = status === RequestStatusEnum.Progress;
    }

    private _setPaginator(paginator: PaginatorData): void {
        this.paginator = paginator;
    }

    private _setProjects(projects: ProjectResource[]): void {
        this.projects = projects;
    }

    private _setSort(sort: SorterData): void {
        this.sort = sort;
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._projectQueries
                .observeProjectList()
                .subscribe(projects => this._setProjects(projects))
        );

        this._disposableSubscriptions.add(
            this._projectQueries
                .observeProjectListPagination()
                .subscribe(paginator => this._setPaginator(paginator))
        );

        this._disposableSubscriptions.add(
            this._projectQueries
                .observeProjectListFilters()
                .subscribe(filters => this._setFilters(filters))
        );

        this._disposableSubscriptions.add(
            this._projectQueries
                .observeProjectListSort()
                .subscribe(sort => this._setSort(sort))
        );

        this._disposableSubscriptions.add(
            this._projectQueries
                .observeProjectListRequestStatus()
                .subscribe(status => this._setLoadingState(status))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
