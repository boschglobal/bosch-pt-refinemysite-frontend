/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';

import {DrawerModule} from '../../../shared/ui/drawer/drawer.module';
import {IconModule} from '../../../shared/ui/icons/icon.module';
import {UIModule} from '../../../shared/ui/ui.module';
import {ProjectCommonModule} from '../../project-common/project-common.module';
import {MultiSelectCommandBarComponent} from './containers/multi-select-command-bar/multi-select-command-bar.component';
import {ProjectTasksAssignCaptureComponent} from './containers/tasks-assign-capture/project-tasks-assign-capture.component';
import {TasksCalendarComponent} from './containers/tasks-calendar/tasks-calendar.component';
import {TasksCalendarActionsComponent} from './containers/tasks-calendar-actions/tasks-calendar-actions.component';
import {TasksCalendarMappingsComponent} from './containers/tasks-calendar-mappings/tasks-calendar-mappings.component';
import {ProjectTasksContentComponent} from './containers/tasks-content/project-tasks-content.component';
import {ProjectTasksCreateComponent} from './containers/tasks-create/project-tasks-create.component';
import {TasksDetailDrawerComponent} from './containers/tasks-detail-drawer/tasks-detail-drawer.component';
import {TasksPreviewComponent} from './containers/tasks-preview/tasks-preview.component';
import {ProjectTasksSendCaptureComponent} from './containers/tasks-send-capture/project-tasks-send-capture.component';
import {TasksToolbarComponent} from './containers/tasks-toolbar/tasks-toolbar.component';
import {CalendarWorkareaRowHeaderComponent} from './presentationals/calendar-workarea-row-header/calendar-workarea-row-header.component';
import {TasksCardPreviewComponent} from './presentationals/tasks-card-preview/tasks-card-preview.component';
import {ProjectTasksComponent} from './presentationals/tasks-component/project-tasks.component';
import {ProjectTasksListComponent} from './presentationals/tasks-list/project-tasks-list.component';
import {ProjectTasksNewsLabelComponent} from './presentationals/tasks-news-label/project-tasks-news-label.component';
import {ProjectTasksPaginationComponent} from './presentationals/tasks-pagination/project-tasks-pagination.component';
import {ProjectTasksSortingComponent} from './presentationals/tasks-sorting/project-tasks-sorting.component';
import {TasksStackedPreviewComponent} from './presentationals/tasks-stacked-preview/tasks-stacked-preview.component';
import {ProjectTasksTableComponent} from './presentationals/tasks-table/project-tasks-table.component';
import {ProjectTaskChildrenModule} from './project-task-children/project-task-children.module';

@NgModule({
    imports: [
        DrawerModule,
        IconModule,
        ProjectCommonModule,
        ProjectTaskChildrenModule,
        UIModule,
    ],
    declarations: [
        CalendarWorkareaRowHeaderComponent,
        MultiSelectCommandBarComponent,
        ProjectTasksAssignCaptureComponent,
        ProjectTasksComponent,
        ProjectTasksContentComponent,
        ProjectTasksCreateComponent,
        ProjectTasksListComponent,
        ProjectTasksNewsLabelComponent,
        ProjectTasksPaginationComponent,
        ProjectTasksSendCaptureComponent,
        ProjectTasksSortingComponent,
        ProjectTasksTableComponent,
        TasksCalendarActionsComponent,
        TasksCalendarComponent,
        TasksCalendarMappingsComponent,
        TasksCardPreviewComponent,
        TasksDetailDrawerComponent,
        TasksPreviewComponent,
        TasksStackedPreviewComponent,
        TasksToolbarComponent,
    ],
    exports: [ProjectTasksComponent],
})
export class ProjectTasksModule {
}
