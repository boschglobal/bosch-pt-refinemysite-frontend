/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    Observable,
    of
} from 'rxjs';

import {ProjectResource} from '../../app/project/project-common/api/projects/resources/project.resource';
import {CurrentProjectPermissions} from '../../app/project/project-common/store/projects/project.slice';
import {RequestStatusEnum} from '../../app/shared/misc/enums/request-status.enum';
import {
    MOCK_PROJECT_1,
    MOCK_PROJECT_2
} from './projects';

@Injectable()
export class ProjectSliceServiceMock {

    constructor() {
    }

    public hasProjects(): boolean {
        return true;
    }

    public hasCreateProjectPermission(): boolean {
        return true;
    }

    public observeCreateProjectPermission(): Observable<boolean> {
        return of(true);
    }

    public hasEditProjectPermission(): boolean {
        return true;
    }

    public observeEditProjectPermission(): Observable<boolean> {
        return of(true);
    }

    public hasAccessToProjectParticipants(): boolean {
        return true;
    }

    public observeAccessToProjectParticipants(): Observable<boolean> {
        return of(true);
    }

    public hasAccessToProjectTasks(): boolean {
        return true;
    }

    public observeAccessToProjectTasks(): Observable<boolean> {
        return of(true);
    }

    public observeCurrentProjectPermissions(): Observable<CurrentProjectPermissions> {
        const permissions: CurrentProjectPermissions = {
            canChangeSortingMode: false,
            canCopyProject: true,
            canCreateCraftMilestone: true,
            canCreateInvestorMilestone: true,
            canCreateProjectMilestone: true,
            canEditProject: true,
            canEditProjectSettings: true,
            canExportProject: true,
            canImportProject: true,
            canRescheduleProject: true,
            canSeeProjectCrafts: true,
            canSeeProjectParticipants: true,
            canSeeProjectTasks: true,
            canSeeWorkareas: true,
        };
        return of(permissions);
    }

    public observeProjectList(): Observable<ProjectResource[]> {
        return of([MOCK_PROJECT_1, MOCK_PROJECT_2]);
    }

    public observeCurrentProject(): Observable<ProjectResource> {
        return of(MOCK_PROJECT_1);
    }

    public observeCurrentProjectId(): Observable<string> {
        return of(MOCK_PROJECT_1.id);
    }

    public observeCurrentProjectRequestStatus(): Observable<RequestStatusEnum> {
        return of(RequestStatusEnum.success);
    }

    public observeProjectListRequestStatus(): Observable<RequestStatusEnum> {
        return of(RequestStatusEnum.success);
    }

    public getCurrentProject(): ProjectResource {
        return MOCK_PROJECT_1;
    }
}
