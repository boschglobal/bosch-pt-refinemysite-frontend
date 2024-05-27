/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    select,
    Store
} from '@ngrx/store';
import {isEqual} from 'lodash';
import {Observable} from 'rxjs';
import {
    distinctUntilChanged,
    filter,
    map,
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {BaseQueries} from '../../../../shared/misc/store/base.queries';
import {ProjectCraftResource} from '../../api/crafts/resources/project-craft.resource';
import {ProjectCraftListLinks} from '../../api/crafts/resources/project-craft-list.resource';
import {ProjectCraftSlice} from './project-craft.slice';

@Injectable({
    providedIn: 'root',
})
export class ProjectCraftQueries extends BaseQueries<ProjectCraftResource, ProjectCraftSlice, ProjectCraftListLinks> {

    public moduleName = 'projectModule';
    public sliceName = 'projectCraftSlice';

    constructor(private _store: Store<State>) {
        super();
    }

    public observeCraftById(id: string): Observable<ProjectCraftResource> {
        return this._store
            .pipe(
                select(this.getItemById(id)),
                filter(item => !!item),
                distinctUntilChanged());
    }

    public observeCrafts(): Observable<ProjectCraftResource[]> {
        return this._store
            .pipe(
                select(this.getList()),
                distinctUntilChanged(isEqual));
    }

    public observeCraftsSortedByName(): Observable<ProjectCraftResource[]> {
        return this.observeCrafts()
            .pipe(
                map(items => [...items].sort((a, b) => a.name.localeCompare(b.name))));
    }

    public observeCraftsRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getListRequestStatus()),
                distinctUntilChanged());
    }

    public observeCreateProjectCraftPermission(): Observable<boolean> {
        return this._store
            .pipe(
                select(this.getListLinks()),
                map((links: ProjectCraftListLinks) => links.hasOwnProperty('create')),
                distinctUntilChanged());
    }

    public observeCurrentCraftRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getCurrentItemRequestStatus()),
                distinctUntilChanged());
    }

    public observeListVersion(): Observable<number> {
        return this._store
            .pipe(
                select(this.getSlice()),
                map((slice: ProjectCraftSlice) => slice.list.version),
                distinctUntilChanged());
    }
}
