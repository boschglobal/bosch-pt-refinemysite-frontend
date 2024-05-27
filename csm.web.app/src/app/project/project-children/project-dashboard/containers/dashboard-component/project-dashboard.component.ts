/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {State} from '../../../../../app.reducers';
import {ModalIdEnum} from '../../../../../shared/misc/enums/modal-id.enum';
import {COLORS} from '../../../../../shared/ui/constants/colors.constant';
import {FlyoutOpenTriggerEnum} from '../../../../../shared/ui/flyout/directive/flyout.directive';
import {ButtonLink} from '../../../../../shared/ui/links/button-link/button-link.component';
import {MenuItemsList} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {ModalService} from '../../../../../shared/ui/modal/api/modal.service';
import {
    ProjectResource,
    ProjectStatistics
} from '../../../../project-common/api/projects/resources/project.resource';
import {TaskDonutChartModel} from '../../../../project-common/containers/task-donut-chart/task-donut-chart.model';
import {
    TaskStatusEnum,
    TaskStatusEnumHelper
} from '../../../../project-common/enums/task-status.enum';
import {ProjectActions} from '../../../../project-common/store/projects/project.actions';
import {CurrentProjectPermissions} from '../../../../project-common/store/projects/project.slice';
import {ProjectSliceService} from '../../../../project-common/store/projects/project-slice.service';
import {ProjectTaskFilters} from '../../../../project-common/store/tasks/slice/project-task-filters';
import {ProjectTaskActions} from '../../../../project-common/store/tasks/task.actions';
import {ProjectUrlRetriever} from '../../../../project-routing/helper/project-url-retriever';
import {ROUTE_PARAM_PROJECT_ID} from '../../../../project-routing/project-route.paths';

interface TaskStatusTile {
    label: string;
    taskNumber: number;
    status: TaskStatusEnum;
}

export enum ProjectDashboardActionsIdsEnum {
    Import = 'Import',
    Export = 'Export',
    Copy = 'Copy',
    Edit = 'Edit',
}

@Component({
    templateUrl: './project-dashboard.component.html',
    styleUrls: ['./project-dashboard.component.scss'],
})
export class ProjectDashboardComponent implements OnInit, OnDestroy {

    /**
     * @description ViewChild for icon template
     */
    @ViewChild('iconTemplate', {static: true})
    public iconTemplate: TemplateRef<any>;

    public dropdownActions: MenuItemsList[] = [];

    public project: ProjectResource;

    public projectLink: ButtonLink = {
        label: 'Project_Dashboard_ViewFullInformationLabel',
        action: this._onViewInformationClick.bind(this),
    };

    public taskChart: TaskDonutChartModel;

    public taskStatusList: TaskStatusTile[] = [];

    public projectCopyTitle = '';

    public permissions: CurrentProjectPermissions;

    public projectCopyModalId = ModalIdEnum.ProjectCopy;

    public projectExportModalId = ModalIdEnum.ProjectExport;

    public projectImportModalId = ModalIdEnum.ProjectImport;

    public tooltipFlyoutTrigger = FlyoutOpenTriggerEnum.Hover;

    public actionButtonColor = COLORS.black;

    public showDropdown = true;

    public projectDashboardActionsIdsEnum = ProjectDashboardActionsIdsEnum;

    private _disposableSubscription: Subscription = new Subscription();

    constructor(private _activatedRoute: ActivatedRoute,
                private _modalService: ModalService,
                private _projectSliceService: ProjectSliceService,
                private _router: Router,
                private _store: Store<State>) {
    }

    /**
     * @description Gets the embedded project picture if available
     * @returns {string}
     */
    public get getProjectPicture(): string {
        return this.project && this.project._embedded.projectPicture ? this.project._embedded.projectPicture._links.small.href : null;
    }

    /**
     *@description Retrieves url for team page
     * @returns {string}
     */
    public get teamUrl(): string {
        return ProjectUrlRetriever.getProjectParticipantsUrl(this._getProjectId());
    }

    /**
     *@description Retrieves url for crafts page
     * @returns {string}
     */
    public get craftsUrl(): string {
        return ProjectUrlRetriever.getProjectCraftsUrl(this._getProjectId());
    }

    /**
     *@description Retrieves url for calendar page
     * @returns {string}
     */
    public get calendarUrl(): string {
        return ProjectUrlRetriever.getProjectCalendarUrl(this._getProjectId());
    }

    /**
     * @description Retrieves url for workareas page
     * @returns {string}
     */
    public get workareasUrl(): string {
        return ProjectUrlRetriever.getProjectWorkareaUrl(this._getProjectId());
    }

    /**
     * @description Retrieves url for KPIs page
     * @returns {string}
     */
    public get kpisUrl(): string {
        return ProjectUrlRetriever.getProjectKpisUrl(this._getProjectId());
    }

    ngOnInit(): void {
        this._requestProject();
        this._setSubscriptions();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    /**
     * @description Closes the opened modal
     * @returns {void}
     */
    public closeModal(): void {
        this._modalService.close();
    }

    /**
     * @description Retrieves a unique identifier for each item
     * @param {number} index
     * @returns {number}
     */
    public trackByFn(index: number): number {
        return index;
    }

    /**
     *@description Gets the appropriate label for the critical topics translation key
     * @returns {string}
     */
    public getTopicLabelKey(): string {
        return this.project._embedded.statistics.criticalTopics === 1 ? 'Generic_CriticalTopic' : 'Generic_CriticalTopics';
    }

    /**
     *@description Gets the appropriate label for the participants translation key
     * @returns {string}
     */
    public getParticipantLabelKey(): string {
        return this.project.participants === 1 ? 'Generic_Participant' : 'Generic_Participants';
    }

    /**
     *@description handles the router navigation
     * @returns {void}
     * @param {string} url
     */
    public handleNavigate(url: string): void {
        this._router.navigateByUrl(url);
    }

    /**
     * @description Set status filter and navigates to task list
     * @param {TaskStatusEnum} status
     */
    public handleSetStatusFilter(status: TaskStatusEnum): void {
        const filters: ProjectTaskFilters = new ProjectTaskFilters();
        filters.criteria.status = [status];
        this._setFiltersAndNavigateToTaskList(filters);
    }

    /**
     * @description Set status filter and navigates to task list
     */
    public handleSetCriticalTopicFilter(): void {
        const filters: ProjectTaskFilters = new ProjectTaskFilters();
        filters.criteria.topicCriticality = ['CRITICAL'];
        this._setFiltersAndNavigateToTaskList(filters);
    }

    /**
     * @description Unset filters and navigates to the project dashboard page
     */
    public handleUnsetFilters(): void {
        const filters: ProjectTaskFilters = new ProjectTaskFilters();
        this._setFiltersAndNavigateToTaskList(filters);
    }

    /**
     *@description handles the click of the generic banner actions
     * @returns {void}
     * @param {ProjectDashboardActionsIdsEnum} action
     */
    public handleActionClick(action: ProjectDashboardActionsIdsEnum): void {
        switch (action) {
            case ProjectDashboardActionsIdsEnum.Import:
                this._openProjectImportModal();
                break;
            case ProjectDashboardActionsIdsEnum.Edit:
                this._onEditClick();
                break;
            case ProjectDashboardActionsIdsEnum.Export:
                this._openProjectExportModal();
                break;
            case ProjectDashboardActionsIdsEnum.Copy:
                this._openProjectCopyModal();
                break;
        }
    }

    private _setFiltersAndNavigateToTaskList(filters: ProjectTaskFilters): void {
        this._store.dispatch(new ProjectTaskActions.Set.Filters(filters));
        this._router.navigateByUrl(ProjectUrlRetriever.getProjectTasksUrl(this._getProjectId()));
    }

    private _requestProject(): void {
        this._store.dispatch(new ProjectActions.Request.CurrentProject());
    }

    private _setSubscriptions(): void {
        this._disposableSubscription.add(
            this._projectSliceService.observeCurrentProject()
                .subscribe(this._setProject.bind(this))
        );

        this._disposableSubscription.add(
            this._projectSliceService.observeCurrentProjectPermissions()
                .subscribe(this._setPermissions.bind(this))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscription.unsubscribe();
    }

    private _setProject(currentProject: ProjectResource): void {
        this.project = currentProject;
        this.projectCopyTitle = currentProject.title;
        this._setTasks(this.project._embedded.statistics);
    }

    private _setPermissions(permissions: CurrentProjectPermissions): void {
        this.permissions = permissions;
        this._setBannerActions();
    }

    private _getProjectId(): string {
        return this._activatedRoute.snapshot.parent.paramMap.get(ROUTE_PARAM_PROJECT_ID);
    }

    private _setTasks(statistics: ProjectStatistics): void {
        this.taskStatusList = [
            {
                label: TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.ACCEPTED),
                taskNumber: statistics.acceptedTasks,
                status: TaskStatusEnum.ACCEPTED,
            },
            {
                label: TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.CLOSED),
                taskNumber: statistics.closedTasks,
                status: TaskStatusEnum.CLOSED,
            },
            {
                label: TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.STARTED),
                taskNumber: statistics.startedTasks,
                status: TaskStatusEnum.STARTED,
            },
            {
                label: TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.OPEN),
                taskNumber: statistics.openTasks,
                status: TaskStatusEnum.OPEN,
            },
            {
                label: TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.DRAFT),
                taskNumber: statistics.draftTasks,
                status: TaskStatusEnum.DRAFT,
            },
        ];

        this.taskChart = new TaskDonutChartModel(this._getProjectId(), statistics);
    }

    private _onViewInformationClick(): void {
        this._router.navigate(['../information'], {relativeTo: this._activatedRoute});
    }

    private _onEditClick(): void {
        this._router.navigateByUrl(ProjectUrlRetriever.getProjectEditUrl(this.project.id));
    }

    private _openProjectImportModal(): void {
        this._modalService.open({
            id: ModalIdEnum.ProjectImport,
            data: null,
        });
    }

    private _openProjectExportModal(): void {
        this._modalService.open({
            id: ModalIdEnum.ProjectExport,
            data: null,
        });
    }

    private _openProjectCopyModal(): void {
        this._modalService.open({
            id: ModalIdEnum.ProjectCopy,
            data: null,
        });
    }

    private _setBannerActions(): void {
        const itemsList = new MenuItemsList();
        itemsList.items = [];
        itemsList.customFigureTemplate = this.iconTemplate;

        this.dropdownActions = [];

        if (this.permissions.canEditProject) {
            itemsList.items.push({
                id: ProjectDashboardActionsIdsEnum.Edit,
                type: 'button',
                label: 'Generic_EditProjectLabel',
                customData: 'edit',
            });
        }
        if (this.permissions.canCopyProject) {
            itemsList.items.push({
                id: ProjectDashboardActionsIdsEnum.Copy,
                type: 'button',
                label: 'Generic_CopyProject',
                customData: 'copy',
            });
        }
        if (this.permissions.canExportProject) {
            itemsList.items.push({
                id: ProjectDashboardActionsIdsEnum.Export,
                type: 'button',
                label: 'Generic_ExportProject',
                customData: 'export',
            });
        }

        this.showDropdown = itemsList.items.filter(item => item.id !== ProjectDashboardActionsIdsEnum.Edit).length > 0;
        this.dropdownActions.push(itemsList);
    }
}
