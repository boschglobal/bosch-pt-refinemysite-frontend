/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';

import {SharedModule} from '../../../../shared/shared.module';
import {IconModule} from '../../../../shared/ui/icons/icon.module';
import {ProjectCommonModule} from '../../../project-common/project-common.module';
import {ProjectTasksEditComponent} from '../containers/tasks-edit/project-tasks-edit.component';
import {ProjectTaskActivitiesListComponent} from './containers/task-activities-list/project-task-activities-list.component';
import {TaskAttachmentsListComponent} from './containers/task-attachments-list/task-attachments-list.component';
import {ProjectTaskComponent} from './containers/task-component/project-task.component';
import {ProjectTaskDateComponent} from './containers/task-date/project-task-date.component';
import {TaskDrawerTopicsComponent} from './containers/task-drawer-topics/task-drawer-topics.component';
import {ProjectTaskInformationComponent} from './containers/task-information-content/project-task-information-content.component';
import {ProjectTaskMessageListComponent} from './containers/task-message-list/project-task-message-list.component';
import {ProjectTaskReplyCaptureComponent} from './containers/task-reply-capture/project-task-reply-capture.component';
import {TaskTopicCreateComponent} from './containers/task-topic-create/task-topic-create.component';
import {TaskTopicsListComponent} from './containers/task-topics-list/task-topics-list.component';
import {ProjectTaskWorkflowComponent} from './containers/task-workflow/project-task-workflow.component';
import {ProjectTaskWorkflowTopicsComponent} from './containers/task-workflow-topics/project-task-workflow-topics.component';
import {ProjectTaskActivityCardComponent} from './presentationals/task-activity-card/project-task-activity-card.component';
import {ProjectTaskDetailComponent} from './presentationals/task-detail/project-task-detail.component';
import {ProjectTaskTopicCaptureComponent} from './presentationals/task-topic-capture/project-task-topic-capture.component';
import {ProjectTaskTopicCardComponent} from './presentationals/task-topic-card/project-task-topic-card.component';
import {ProjectTaskChildrenComponent} from './project-task-children.component';

@NgModule({
    imports: [
        IconModule,
        ProjectCommonModule,
        SharedModule,
    ],
    declarations: [
        ProjectTaskActivitiesListComponent,
        ProjectTaskActivityCardComponent,
        ProjectTaskChildrenComponent,
        ProjectTaskComponent,
        ProjectTaskDetailComponent,
        ProjectTasksEditComponent,
        ProjectTaskInformationComponent,
        ProjectTaskMessageListComponent,
        ProjectTaskReplyCaptureComponent,
        ProjectTaskTopicCaptureComponent,
        ProjectTaskTopicCardComponent,
        ProjectTaskWorkflowComponent,
        ProjectTaskWorkflowTopicsComponent,
        ProjectTaskDateComponent,
        TaskAttachmentsListComponent,
        TaskDrawerTopicsComponent,
        TaskTopicCreateComponent,
        TaskTopicsListComponent,
    ],
    exports: [
        ProjectTasksEditComponent,
        ProjectTaskDateComponent,
        TaskDrawerTopicsComponent,
        TaskTopicCreateComponent,
    ],
})
export class ProjectTaskChildrenModule {
}
