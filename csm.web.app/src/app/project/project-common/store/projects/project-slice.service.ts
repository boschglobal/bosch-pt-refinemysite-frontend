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
import {
    Observable,
    zip,
} from 'rxjs';
import {
    distinctUntilChanged,
    filter,
    map,
    take
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ProjectResource} from '../../api/projects/resources/project.resource';
import {ProjectListLinks} from '../../api/projects/resources/project-list.resource';
import {ProjectQueries} from './project.queries';
import {CurrentProjectPermissions} from './project.slice';

@Injectable({
    providedIn: 'root',
})
export class ProjectSliceService {

    private _projectQueries: ProjectQueries = new ProjectQueries();

    constructor(private _store: Store<State>) {
    }

    public getCurrentProjectId(): string {
        let result: string;
        this.observeCurrentProjectId()
            .pipe(
                take(1))
            .subscribe(id => result = id)
            .unsubscribe();
        return result;
    }

    public hasProjects(): boolean {
        let result: boolean;
        this.observeProjectList()
            .pipe(
                map((projectList: ProjectResource[]) => projectList.length > 0),
                take(1))
            .subscribe(hasProjects => result = hasProjects)
            .unsubscribe();
        return result;
    }

    public hasProjectById(id: string): boolean {
        let result: boolean;
        this.observeProjectById(id)
            .pipe(
                map((project: ProjectResource) => !!project),
                take(1))
            .subscribe(hasProjectById => result = hasProjectById)
            .unsubscribe();
        return result;
    }

    public hasCreateProjectPermission(): boolean {
        let permission: boolean;
        this.observeCreateProjectPermission()
            .pipe(
                take(1))
            .subscribe(perm => permission = perm)
            .unsubscribe();
        return permission;
    }

    public hasEditProjectPermission(): boolean {
        let permission: boolean;
        this.observeEditProjectPermission()
            .pipe(
                take(1))
            .subscribe(perm => permission = perm)
            .unsubscribe();
        return permission;
    }

    public hasAccessToProjectParticipants(): boolean {
        let permission: boolean;
        this.observeAccessToProjectParticipants()
            .pipe(
                take(1))
            .subscribe(perm => permission = perm)
            .unsubscribe();
        return permission;
    }

    public hasAccessToProjectTasks(): boolean {
        let permission: boolean;
        this.observeAccessToProjectTasks()
            .pipe(
                take(1))
            .subscribe(perm => permission = perm)
            .unsubscribe();
        return permission;
    }

    public hasAccessToProjectCrafts(): boolean {
        let hasAccess: boolean;
        this.observeAccessToProjectCraft()
            .pipe(
                take(1))
            .subscribe(permission => hasAccess = permission)
            .unsubscribe();
        return hasAccess;
    }

    public hasAccessToProjectWorkareas(): boolean {
        let hasAccess: boolean;
        this.observeAccessToProjectWorkareas()
            .pipe(
                take(1))
            .subscribe(permission => hasAccess = permission)
            .unsubscribe();
        return hasAccess;
    }

    public getCurrentProject(): ProjectResource {
        let project: ProjectResource = new ProjectResource();
        this.observeCurrentProject()
            .pipe(
                take(1))
            .subscribe(currentProject => project = currentProject)
            .unsubscribe();
        return project;
    }

    public observeCreateProjectPermission(): Observable<boolean> {
        return this.observeListPermission('create');
    }

    public observeEditProjectPermission(): Observable<boolean> {
        return this.observeCurrentItemPermission('update');
    }

    public observeAccessToProjectParticipants(): Observable<boolean> {
        return this.observeCurrentItemPermission('participants');
    }

    public observeAccessToProjectTasks(): Observable<boolean> {
        return this.observeCurrentItemPermission('tasks');
    }

    public observeAccessToProjectCraft(): Observable<boolean> {
        return this.observeCurrentItemPermission('projectCrafts');
    }

    public observeAccessToProjectWorkareas(): Observable<boolean> {
        return this.observeCurrentItemPermission('workAreas');
    }

    public observeAccessToProjectSettings(): Observable<boolean> {
        const links = ProjectQueries.getProjectEditSettingsPermissionLinks();
        const permissions = links.map(link => this.observeCurrentItemPermission(link));

        return zip(...permissions)
            .pipe(
                map(results => results.some(result => !!result)));
    }

    public observeProjectById(id: string): Observable<ProjectResource> {
        return this._store
            .pipe(
                select(this._projectQueries.getItemById(id)),
                distinctUntilChanged());
    }

    public observeCurrentProject(): Observable<ProjectResource> {
        return this._store
            .pipe(
                select(this._projectQueries.getCurrentItem()),
                filter(project => !!project),
                distinctUntilChanged()
            );
    }

    public observeCurrentProjectId(): Observable<string> {
        return this._store
            .pipe(
                select(this._projectQueries.getCurrentItemId()),
                filter(projectId => !!projectId),
                distinctUntilChanged());
    }

    public observeCurrentProjectPermissions(): Observable<CurrentProjectPermissions> {
        return this._store
            .pipe(
                select(this._projectQueries.getCurrentItem()),
                filter(project => !!project),
                distinctUntilChanged(),
                map(project => ({
                    canChangeSortingMode: Object.prototype.hasOwnProperty.call(project._links, 'calendarCustomSort'),
                    canCreateCraftMilestone: Object.prototype.hasOwnProperty.call(project._links, 'createCraftMilestone'),
                    canCreateInvestorMilestone: Object.prototype.hasOwnProperty.call(project._links, 'createInvestorMilestone'),
                    canCreateProjectMilestone: Object.prototype.hasOwnProperty.call(project._links, 'createProjectMilestone'),
                    canCopyProject: Object.prototype.hasOwnProperty.call(project._links, 'copy'),
                    canEditProject: Object.prototype.hasOwnProperty.call(project._links, 'update'),
                    canEditProjectSettings: ProjectQueries.projectHasEditSettingsPermissions(project),
                    canExportProject: Object.prototype.hasOwnProperty.call(project._links, 'export'),
                    canImportProject: Object.prototype.hasOwnProperty.call(project._links, 'import'),
                    canRescheduleProject: Object.prototype.hasOwnProperty.call(project._links, 'reschedule'),
                    canSeeProjectCrafts: Object.prototype.hasOwnProperty.call(project._links, 'projectCrafts'),
                    canSeeProjectParticipants: Object.prototype.hasOwnProperty.call(project._links, 'participants'),
                    canSeeProjectTasks: Object.prototype.hasOwnProperty.call(project._links, 'tasks'),
                    canSeeWorkareas: Object.prototype.hasOwnProperty.call(project._links, 'workAreas'),
                })));
    }

    public observeCurrentProjectRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this._projectQueries.getCurrentItemRequestStatus()),
                distinctUntilChanged());
    }

    public observeProjectListRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this._projectQueries.getListRequestStatus()),
                distinctUntilChanged());
    }

    public observeProjectList(): Observable<ProjectResource[]> {
        return this._store
            .pipe(
                select(this._projectQueries.getList()),
                distinctUntilChanged());
    }

    public observeCurrentItemPermission(permissionKey: string): Observable<boolean> {
        return this._store
            .pipe(
                select(this._projectQueries.getCurrentItem()),
                filter(project => !!project),
                map(project => Object.prototype.hasOwnProperty.call(project._links, permissionKey)),
                distinctUntilChanged());
    }

    public observeListPermission(permissionKey: string): Observable<boolean> {
        return this._store
            .pipe(
                select(this._projectQueries.getListLinks()),
                map((links: ProjectListLinks) => Object.prototype.hasOwnProperty.call(links, permissionKey)),
                distinctUntilChanged());
    }

    public observeUserIsActivated(): Observable<boolean> {
        return this._store
            .pipe(
                select(this._projectQueries.getSlice()),
                map(projectSlice => projectSlice.userActivated),
                distinctUntilChanged()
            );
    }
}
