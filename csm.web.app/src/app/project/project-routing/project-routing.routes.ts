/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Routes} from '@angular/router';

import {AuthenticatedAndRegisteredGuard} from '../../auth/auth-routing/guards/authenticated-and-registered.guard';
import {ROUTE_DATA_BREADCRUMB} from '../../shared/navigation/components/breadcrumb-component/breadcrumb.component';
import {
    NavBarRawItem,
    ROUTE_DATA_NAVBAR
} from '../../shared/navigation/components/navbar-component/navbar.component';
import {NavigationRouteData} from '../../shared/navigation/interfaces/navigation-route-data';
import {ProjectComponent} from '../project.component';
import {ProjectChildrenComponent} from '../project-children/project-children.component';
import {ProjectCraftsComponent} from '../project-children/project-crafts/presentationals/crafts/project-crafts.component';
import {ProjectDashboardComponent} from '../project-children/project-dashboard/containers/dashboard-component/project-dashboard.component';
import {ProjectEditComponent} from '../project-children/project-edit/containers/edit-component/project-edit.component';
import {ProjectInformationComponent} from '../project-children/project-information/containers/information-component/project-information.component';
import {ProjectKpisComponent} from '../project-children/project-kpis/presentationals/kpis/project-kpis.component';
import {ProjectPpcComponent} from '../project-children/project-kpis/project-kpis-children/presentationals/ppc/project-ppc.component';
import {ProjectRfvComponent} from '../project-children/project-kpis/project-kpis-children/presentationals/rfv/project-rfv.component';
import {ProjectParticipantsComponent} from '../project-children/project-participants/containers/participants-component/project-participants.component';
import {ProjectParticipantsChildrenComponent} from '../project-children/project-participants/project-participants-children/containers/participants-children/project-participants-children.component';
import {ProjectSettingsComponent} from '../project-children/project-settings/presentationals/settings/project-settings.component';
import {ConstraintListComponent} from '../project-children/project-settings/project-settings-children/containers/constraint-list/constraint-list.component';
import {ProjectRfvListComponent} from '../project-children/project-settings/project-settings-children/containers/rfv-list/project-rfv-list.component';
import {WorkingDaysComponent} from '../project-children/project-settings/project-settings-children/containers/working-days/working-days.component';
import {TasksCalendarComponent} from '../project-children/project-tasks/containers/tasks-calendar/tasks-calendar.component';
import {ProjectTasksComponent} from '../project-children/project-tasks/presentationals/tasks-component/project-tasks.component';
import {ProjectTaskActivitiesListComponent} from '../project-children/project-tasks/project-task-children/containers/task-activities-list/project-task-activities-list.component';
import {TaskAttachmentsListComponent} from '../project-children/project-tasks/project-task-children/containers/task-attachments-list/task-attachments-list.component';
import {ProjectTaskComponent} from '../project-children/project-tasks/project-task-children/containers/task-component/project-task.component';
import {ProjectTaskInformationComponent} from '../project-children/project-tasks/project-task-children/containers/task-information-content/project-task-information-content.component';
import {ProjectTaskWorkflowTopicsComponent} from '../project-children/project-tasks/project-task-children/containers/task-workflow-topics/project-task-workflow-topics.component';
import {ProjectTaskChildrenComponent} from '../project-children/project-tasks/project-task-children/project-task-children.component';
import {ProjectWorkareasComponent} from '../project-children/project-workareas/presentationals/workareas/project-workareas.component';
import {ProjectParticipantQueries} from '../project-common/store/participants/project-participant.queries';
import {ProjectQueries} from '../project-common/store/projects/project.queries';
import {ProjectTaskQueries} from '../project-common/store/tasks/task-queries';
import {ProjectCreateComponent} from '../project-create/containers/project-create/project-create.component';
import {ProjectListComponent} from '../project-list/containers/project-list/project-list.component';
import {CanCreateProjectGuard} from './guards/can-create-project.guard';
import {CanDeactivateCurrentTaskGuard} from './guards/can-deactivate-current-task.guard';
import {CanDeactivateProjectCalendarGuard} from './guards/can-deactivate-project-calendar.guard';
import {CanEditProjectGuard} from './guards/can-edit-project.guard';
import {CanSeeProjectCalendarGuard} from './guards/can-see-project-calendar.guard';
import {CanSeeProjectCraftsGuard} from './guards/can-see-project-crafts.guard';
import {CanSeeProjectParticipantsGuard} from './guards/can-see-project-participants.guard';
import {CanSeeProjectSettingsGuard} from './guards/can-see-project-settings.guard';
import {CanSeeProjectTasksGuard} from './guards/can-see-project-tasks.guard';
import {CanSeeProjectWorkareasGuard} from './guards/can-see-project-workareas.guard';
import {ProjectUrlRetriever} from './helper/project-url-retriever';
import {
    PROJECT_ROUTE_PATHS,
    TASK_DETAIL_OUTLET_NAME,
    TASK_WORKFLOW_OUTLET_NAME
} from './project-route.paths';
import {ParticipantResolverGuard} from './resolver/participant-resolver.guard';
import {CurrentProjectResolverGuard} from './resolver/project-resolver.guard';
import {CurrentTaskResolverGuard} from './resolver/task-resolver.guard';

const fixedNavBarItems: NavBarRawItem[] = [
    {
        staticLabel: 'Generic_ProjectLabel',
        icon: 'home',
        url: '/projects/list',
        permissions: true,
        exact: true,
    },
];

const navBarItems: NavBarRawItem[] = [
    {
        dynamicLabel: ProjectQueries.getProjectName,
        icon: 'folder',
        url: ProjectUrlRetriever.getCurrentProjectDashboardUrl,
        permissions: true,
        exact: true,
    },
    {
        staticLabel: 'Project_Dashboard_TasksLabel',
        icon: 'list',
        url: ProjectUrlRetriever.getCurrentProjectTasksUrl,
        permissions: ProjectQueries.getProjectTasksPermission,
    },
    {
        staticLabel: 'Generic_CalendarLabel',
        icon: 'calendar',
        url: ProjectUrlRetriever.getCurrentProjectCalendarUrl,
        permissions: ProjectQueries.getProjectTasksPermission,
    },
    {
        staticLabel: 'Generic_KPI',
        icon: 'chart',
        url: ProjectUrlRetriever.getCurrentProjectKpisUrl,
        permissions: true,
    },
    {
        staticLabel: 'Generic_TeamLabel',
        icon: 'participants',
        url: ProjectUrlRetriever.getCurrentProjectParticipantsUrl,
        permissions: ProjectQueries.getProjectParticipantsPermission,
    },
    {
        staticLabel: 'Project_Dashboard_CraftsLabel',
        icon: 'crafts',
        url: ProjectUrlRetriever.getCurrentProjectCraftsUrl,
        permissions: ProjectQueries.getProjectCraftsPermission,
    },
    {
        staticLabel: 'Project_Dashboard_WorkareaTitle',
        icon: 'workarea',
        url: ProjectUrlRetriever.getCurrentProjectWorkareaUrl,
        permissions: ProjectQueries.getProjectWorkareasPermission,
    },
    {
        staticLabel: 'Project_Dashboard_InformationLabel',
        icon: 'info',
        url: ProjectUrlRetriever.getCurrentProjectInformationUrl,
        permissions: true,
    },
    {
        staticLabel: 'Generic_Settings',
        icon: 'settings',
        url: ProjectUrlRetriever.getCurrentProjectSettingsUrl,
        permissions: ProjectQueries.getProjectEditSettingsPermission,
    },
];

export const PROJECT_ROUTE_DATA: { [key: string]: NavigationRouteData } = {
    calendar: {
        [ROUTE_DATA_BREADCRUMB]: {staticLabel: 'Generic_CalendarLabel'},
    },
    create: {[ROUTE_DATA_BREADCRUMB]: {staticLabel: 'Generic_CreateProjectLabel'}},
    dashboard: {
        [ROUTE_DATA_BREADCRUMB]: {staticLabel: 'Generic_DashboardLabel'},
    },
    edit: {[ROUTE_DATA_BREADCRUMB]: {staticLabel: 'Generic_EditProjectLabel'}},
    information: {[ROUTE_DATA_BREADCRUMB]: {staticLabel: 'Generic_ProjectInformationLabel'}},
    list: {
        [ROUTE_DATA_BREADCRUMB]: {staticLabel: 'Generic_ProjectLabel'},
        [ROUTE_DATA_NAVBAR]: fixedNavBarItems,
    },
    participants: {[ROUTE_DATA_BREADCRUMB]: {staticLabel: 'Generic_TeamLabel'}},
    participantDetail: {[ROUTE_DATA_BREADCRUMB]: {dynamicLabel: ProjectParticipantQueries.getParticipantName}},
    crafts: {[ROUTE_DATA_BREADCRUMB]: {staticLabel: 'Generic_CraftsLabel'}},
    project: {
        [ROUTE_DATA_BREADCRUMB]: {dynamicLabel: ProjectQueries.getProjectName},
        [ROUTE_DATA_NAVBAR]: navBarItems,
    },
    tasks: {[ROUTE_DATA_BREADCRUMB]: {staticLabel: 'Generic_TasksLabel'}},
    taskDetail: {[ROUTE_DATA_BREADCRUMB]: {dynamicLabel: ProjectTaskQueries.getTaskName}},
    workareas: {[ROUTE_DATA_BREADCRUMB]: {staticLabel: 'Project_Dashboard_WorkareaTitle'}},
    kpis: {[ROUTE_DATA_BREADCRUMB]: {staticLabel: 'Generic_KPI'}},
    settings: {[ROUTE_DATA_BREADCRUMB]: {staticLabel: 'Generic_Settings'}},
};

export const PROJECT_ROUTES: Routes = [
    {
        path: PROJECT_ROUTE_PATHS.projects,
        canActivate: [AuthenticatedAndRegisteredGuard],
        component: ProjectComponent,
        data: PROJECT_ROUTE_DATA.list,
        children: [
            {
                path: '',
                redirectTo: PROJECT_ROUTE_PATHS.list,
                pathMatch: 'prefix',
            },
            {
                path: PROJECT_ROUTE_PATHS.list,
                component: ProjectListComponent,
            },
            {
                path: PROJECT_ROUTE_PATHS.create,
                canActivate: [CanCreateProjectGuard],
                component: ProjectCreateComponent,
                data: PROJECT_ROUTE_DATA.create,
            },
            {
                path: PROJECT_ROUTE_PATHS.projectId,
                canActivate: [CurrentProjectResolverGuard],
                component: ProjectChildrenComponent,
                data: PROJECT_ROUTE_DATA.project,
                children: [
                    {
                        path: '',
                        redirectTo: PROJECT_ROUTE_PATHS.dashboard,
                        pathMatch: 'prefix',
                    },
                    {
                        path: PROJECT_ROUTE_PATHS.dashboard,
                        component: ProjectDashboardComponent,
                    },
                    {
                        path: PROJECT_ROUTE_PATHS.edit,
                        component: ProjectEditComponent,
                        canActivate: [CanEditProjectGuard],
                        data: PROJECT_ROUTE_DATA.edit,
                    },
                    {
                        path: PROJECT_ROUTE_PATHS.information,
                        component: ProjectInformationComponent,
                        data: PROJECT_ROUTE_DATA.information,
                    },
                    {
                        path: PROJECT_ROUTE_PATHS.participants,
                        canActivate: [CanSeeProjectParticipantsGuard],
                        component: ProjectParticipantsComponent,
                        data: PROJECT_ROUTE_DATA.participants,
                    },
                    {
                        path: PROJECT_ROUTE_PATHS.participants,
                        component: ProjectParticipantsChildrenComponent,
                        data: PROJECT_ROUTE_DATA.participants,
                        children: [
                            {
                                path: PROJECT_ROUTE_PATHS.participantId,
                                canActivate: [ParticipantResolverGuard],
                                component: ProjectParticipantsChildrenComponent,
                                data: PROJECT_ROUTE_DATA.participantDetail,
                            },
                        ],
                    },
                    {
                        path: PROJECT_ROUTE_PATHS.crafts,
                        canActivate: [CanSeeProjectCraftsGuard],
                        component: ProjectCraftsComponent,
                        data: PROJECT_ROUTE_DATA.crafts,
                    },
                    {
                        path: PROJECT_ROUTE_PATHS.tasks,
                        canActivate: [CanSeeProjectTasksGuard],
                        component: ProjectTasksComponent,
                        data: PROJECT_ROUTE_DATA.tasks,
                    },
                    {
                        path: PROJECT_ROUTE_PATHS.calendar,
                        canActivate: [CanSeeProjectCalendarGuard, CanSeeProjectTasksGuard],
                        canDeactivate: [CanDeactivateProjectCalendarGuard],
                        component: TasksCalendarComponent,
                        data: PROJECT_ROUTE_DATA.calendar,
                    },
                    {
                        path: PROJECT_ROUTE_PATHS.tasks,
                        component: ProjectTaskChildrenComponent,
                        data: PROJECT_ROUTE_DATA.tasks,
                        children: [
                            {
                                path: PROJECT_ROUTE_PATHS.taskId,
                                canActivate: [CurrentTaskResolverGuard],
                                canDeactivate: [CanDeactivateCurrentTaskGuard],
                                component: ProjectTaskComponent,
                                data: PROJECT_ROUTE_DATA.taskDetail,
                                children: [
                                    {
                                        path: PROJECT_ROUTE_PATHS.taskTopics,
                                        component: ProjectTaskWorkflowTopicsComponent,
                                        outlet: TASK_WORKFLOW_OUTLET_NAME,
                                    },
                                    {
                                        path: PROJECT_ROUTE_PATHS.taskInformation,
                                        component: ProjectTaskInformationComponent,
                                        outlet: TASK_DETAIL_OUTLET_NAME,
                                    },
                                    {
                                        path: PROJECT_ROUTE_PATHS.taskActivities,
                                        component: ProjectTaskActivitiesListComponent,
                                        outlet: TASK_WORKFLOW_OUTLET_NAME,
                                    },
                                    {
                                        path: PROJECT_ROUTE_PATHS.taskAttachments,
                                        component: TaskAttachmentsListComponent,
                                        outlet: TASK_WORKFLOW_OUTLET_NAME,
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        path: PROJECT_ROUTE_PATHS.workareas,
                        canActivate: [CanSeeProjectWorkareasGuard],
                        component: ProjectWorkareasComponent,
                        data: PROJECT_ROUTE_DATA.workareas,
                    },
                    {
                        path: PROJECT_ROUTE_PATHS.kpis,
                        component: ProjectKpisComponent,
                        data: PROJECT_ROUTE_DATA.kpis,
                        children: [
                            {
                                path: '',
                                redirectTo: PROJECT_ROUTE_PATHS.ppc,
                                pathMatch: 'prefix',
                            },
                            {
                                path: PROJECT_ROUTE_PATHS.ppc,
                                component: ProjectPpcComponent,
                            },
                            {
                                path: PROJECT_ROUTE_PATHS.rfv,
                                component: ProjectRfvComponent,
                            },
                        ],
                    },
                    {
                        path: PROJECT_ROUTE_PATHS.settings,
                        canActivate: [CanSeeProjectSettingsGuard],
                        component: ProjectSettingsComponent,
                        data: PROJECT_ROUTE_DATA.settings,
                        children: [
                            {
                                path: '',
                                redirectTo: PROJECT_ROUTE_PATHS.settingsRfv,
                                pathMatch: 'prefix',
                            },
                            {
                                path: PROJECT_ROUTE_PATHS.settingsRfv,
                                component: ProjectRfvListComponent,
                            },
                            {
                                path: PROJECT_ROUTE_PATHS.settingsConstraints,
                                component: ConstraintListComponent,
                            },
                            {
                                path: PROJECT_ROUTE_PATHS.settingsWorkingDays,
                                component: WorkingDaysComponent,
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
