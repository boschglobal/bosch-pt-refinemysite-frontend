/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    OnDestroy,
    OnInit
} from '@angular/core';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {State} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ProjectResource} from '../../../project-common/api/projects/resources/project.resource';
import {ProjectActions} from '../../../project-common/store/projects/project.actions';
import {ProjectSliceService} from '../../../project-common/store/projects/project-slice.service';
import {ProjectUrlRetriever} from '../../../project-routing/helper/project-url-retriever';

const MAX_NUMBER_OF_RETRIES = 3;

@Component({
    selector: 'ss-project-list',
    templateUrl: './project-list.component.html',
    styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent implements OnInit, OnDestroy {

    /**
     * @description The List of Projects to be shown
     */
    public projectList: ProjectResource[] = [];

    /**
     * @description Flag indicating if user has permission to create a new project
     */
    public hasCreatePermission: boolean;

    /**
     * @description Loading state of the list
     * @type {boolean}
     */
    public isLoading: boolean;

    /**
     * @description Property with no project button information
     * @type {string}
     */
    public buttonProperty: {text: string; icon: string } = {
        text: 'Generic_CreateProject',
        icon: 'more',
    };

    public isUnavailable: boolean;

    public isUserActivated: boolean;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _autoRetriesCounter = 0;

    constructor(private _projectSliceService: ProjectSliceService,
                private _store: Store<State>,
                private _router: Router) {
    }

    ngOnInit() {
        this._setSubscriptions();
        this._requestProjects();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    /**
     * @description Retrieves a unique identifier for each item
     * @param {number} index
     * @param {ProjectResource} item
     * @returns {string}
     */
    public trackByFn(index: number, item: ProjectResource): string {
        return item.id;
    }

    public get canRenderProjectsUnavailable(): boolean {
        return !this.isLoading && this.projectList.length === 0 && this.isUnavailable;
    }

    public get showEmptyState(): boolean {
        return !this.isLoading && this.projectList.length === 0 && !this.isUnavailable;
    }

    public handleRetry(): void {
        this._requestProjects();
    }

    /**
     * @description Retrieves the url to create project
     */
    public navigateToCreate(): void {
        this._router.navigateByUrl(ProjectUrlRetriever.getProjectCreateUrl());
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._projectSliceService.observeProjectList()
                .subscribe(this._setProject.bind(this))
        );

        this._disposableSubscriptions.add(
            this._projectSliceService.observeCreateProjectPermission()
                .subscribe(this._setCreatePermission.bind(this))
        );

        this._disposableSubscriptions.add(
            this._projectSliceService.observeProjectListRequestStatus()
                .subscribe(this._handleRequestStatus.bind(this))
        );

        this._disposableSubscriptions.add(
            this._projectSliceService.observeUserIsActivated()
                .subscribe(this._setUserIsActivated.bind(this))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _requestProjects(): void {
        this._store.dispatch(new ProjectActions.Request.Projects());
    }

    private _setProject(projectList: ProjectResource[]): void {
        this.projectList = projectList;
    }

    private _setCreatePermission(permission: boolean): void {
        this.hasCreatePermission = permission;
    }

    private _setUserIsActivated(userIsActivated: boolean): void {
        this.isUserActivated = userIsActivated;
    }

    private _handleRequestStatus(requestStatus: RequestStatusEnum): void {
        if (requestStatus === RequestStatusEnum.error && this._autoRetriesCounter < MAX_NUMBER_OF_RETRIES) {
            this._autoRetriesCounter++;
            setTimeout(() => this._requestProjects(), Math.pow(2, this._autoRetriesCounter) * 1000);
        } else {
            this.isLoading = requestStatus === RequestStatusEnum.progress;
            this.isUnavailable = requestStatus === RequestStatusEnum.error;
        }
    }
}
