/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    select,
    Store,
} from '@ngrx/store';
import {
    distinctUntilChanged,
    map,
    take,
} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {isEqual} from 'lodash';

import {State} from '../../../app.reducers';
import {SorterData} from '../../../shared/ui/sorter/sorter-data.datastructure';
import {ProjectSlice} from './project.slice';
import {BaseQueries} from '../../../shared/misc/store/base.queries';
import {PaginatorData} from '../../../shared/ui/paginator/paginator-data.datastructure';
import {ProjectFiltersResource} from '../api/resources/project-filters.resource';
import {ProjectListLinks} from '../api/resources/project-list.resource';
import {ProjectResource} from '../api/resources/project.resource';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';

@Injectable({
    providedIn: 'root',
})
export class ProjectQueries extends BaseQueries<ProjectResource, ProjectSlice, ProjectListLinks> {

    public sliceName = 'projectSlice';

    constructor(private _store: Store<State>) {
        super();
    }

    /**
     * @description Retrieves Observable of current project
     * @returns {Observable<ProjectResource>}
     */
    public observeCurrentProject(): Observable<ProjectResource> {
        return this._store
            .pipe(
                select(this.getCurrentItem()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of current Project request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeCurrentProjectRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getCurrentItemRequestStatus()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of Project of a given id
     * @returns {Observable<ProjectResource>}
     */
    public observeProjectById(id: string): Observable<ProjectResource> {
        return this._store
            .pipe(
                select(this.getItemById(id)),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of current Project list
     * @returns {Observable<ProjectResource[]>}
     */
    public observeProjectList(): Observable<ProjectResource[]> {
        return this._store
            .pipe(
                select(this.getCurrentPage()),
                distinctUntilChanged(isEqual));
    }

    /**
     * @description Retrieves Observable of current Project request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeProjectListRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getListRequestStatus()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of current filtering information
     * @returns {Observable<ProjectFiltersResource>}
     */
    public observeProjectListFilters(): Observable<ProjectFiltersResource> {
        return this._store
            .pipe(
                select(this._getListFilters()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of current sorting information
     * @returns {Observable<SorterData>}
     */
    public observeProjectListSort(): Observable<SorterData> {
        return this._store
            .pipe(
                select(this.getListSort()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of current pagination information
     * @returns {Observable<PaginatorData>}
     */
    public observeProjectListPagination(): Observable<PaginatorData> {
        return this._store
            .pipe(
                select(this.getListPagination()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves whether the Project for given id exists
     * @param {string} id
     * @returns {boolean}
     */
    public hasProjectById(id: string): boolean {
        let result = false;

        this.observeProjectById(id)
            .pipe(
                map((project: ProjectResource) => !!project),
                take(1))
            .subscribe(hasProject => result = hasProject)
            .unsubscribe();
        return result;
    }

    private _getListFilters(): (state: State) => ProjectFiltersResource {
        return (state: State) =>
            this._getSlice(state).list.filters;
    }
}
