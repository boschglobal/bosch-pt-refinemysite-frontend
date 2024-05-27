/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {DragDropModule} from '@angular/cdk/drag-drop';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {EffectsModule} from '@ngrx/effects';

import {SharedModule} from '../../shared/shared.module';
import {DrawerModule} from '../../shared/ui/drawer/drawer.module';
import {IconModule} from '../../shared/ui/icons/icon.module';
import {DayCardDetailComponent} from '../project-children/project-tasks/containers/day-card-detail/day-card-detail.component';
import {CalendarExportComponent} from './containers/calendar-export/calendar-export.component';
import {CommonFilterCaptureComponent} from './containers/common-filter-capture/common-filter-capture.component';
import {DayCardCreateComponent} from './containers/day-card-create/day-card-create.component';
import {DayCardEditComponent} from './containers/day-card-edit/day-card-edit.component';
import {DayCardMultipleReasonComponent} from './containers/day-card-multiple-reason/day-card-multiple-reason.component';
import {DayCardReasonComponent} from './containers/day-card-reason/day-card-reason.component';
import {DayCardStatusComponent} from './containers/day-card-staus/day-card-status.component';
import {DependenciesListComponent} from './containers/dependencies-list/dependencies-list.component';
import {MilestoneComponent} from './containers/milestone/milestone.component';
import {MilestoneCaptureComponent} from './containers/milestone-capture/milestone-capture.component';
import {MilestoneDetailDrawerComponent} from './containers/milestone-detail-drawer/milestone-detail-drawer.component';
import {MilestoneEditComponent} from './containers/milestone-edit/milestone-edit.component';
import {MilestoneFilterCaptureComponent} from './containers/milestone-filter-capture/milestone-filter-capture.component';
import {MilestoneTaskRelationListComponent} from './containers/milestone-task-relation-list/milestone-task-relation-list.component';
import {MilestoneTypeOptionsComponent} from './containers/milestone-type-options/milestone-type-options.component';
import {ProjectFilterCaptureComponent} from './containers/project-filter-capture/project-filter-capture.component';
import {ProjectFilterChipsComponent} from './containers/project-filter-chips/project-filter-chips.component';
import {ProjectFilterDrawerComponent} from './containers/project-filter-drawer/project-filter-drawer.component';
import {ProjectOverviewCardComponent} from './containers/project-overview-card/project-overview-card.component';
import {ProjectRescheduleDrawerComponent} from './containers/project-reschedule-drawer/project-reschedule-drawer.component';
import {ProjectRescheduleReviewComponent} from './containers/project-reschedule-review/project-reschedule-review.component';
import {QuickFilterCaptureComponent} from './containers/quick-filter-capture/quick-filter-capture.component';
import {QuickFilterDrawerComponent} from './containers/quick-filter-drawer/quick-filter-drawer.component';
import {QuickFilterListComponent} from './containers/quick-filter-list/quick-filter-list.component';
import {ProjectRescheduleShiftCaptureComponent} from './containers/reschedule-shift-capture/project-reschedule-shift-capture.component';
import {TaskCardWeekComponent} from './containers/task-card-week/task-card-week.component';
import {TaskConstraintsComponent} from './containers/task-constraints/task-constraints.component';
import {TaskConstraintsLabelComponent} from './containers/task-constraints-label/task-constraints-label.component';
import {TaskDaycardsComponent} from './containers/task-daycards/task-daycards.component';
import {TaskDonutChartComponent} from './containers/task-donut-chart/task-donut-chart.component';
import {TaskMilestoneRelationListComponent} from './containers/task-milestone-relation-list/task-milestone-relation-list.component';
import {TaskStatusDropdownComponent} from './containers/task-status-dropdown/task-status-dropdown.component';
import {ProjectTasksCaptureComponent} from './containers/tasks-capture/project-tasks-capture.component';
import {ProjectTasksCardAssigneeComponent} from './containers/tasks-card-assignee/project-tasks-card-assignee.component';
import {TasksFilterCaptureComponent} from './containers/tasks-filter-capture/tasks-filter-capture.component';
import {TaskShiftAmountPipe} from './pipes/task-shift-amount/task-shift-amount.pipe';
import {CraftLabelComponent} from './presentationals/craft-label/craft-label.component';
import {DayCardComponent} from './presentationals/day-card/day-card.component';
import {DayCardCaptureComponent} from './presentationals/day-card-capture/day-card-capture.component';
import {DayCardIndicatorComponent} from './presentationals/day-card-indicator/day-card-indicator.component';
import {DayCardLockedComponent} from './presentationals/day-card-locked/day-card-locked.component';
import {DayCardReasonCaptureComponent} from './presentationals/day-card-reason-capture/day-card-reason-capture.component';
import {MilestoneCreationSlotsComponent} from './presentationals/milestone-creation-slots/milestone-creation-slots.component';
import {MilestoneDateLabelComponent} from './presentationals/milestone-date-label/milestone-date-label.component';
import {MilestoneLocationLabelComponent} from './presentationals/milestone-location-label/milestone-location-label.component';
import {MilestoneMarkerComponent} from './presentationals/milestone-marker/milestone-marker.component';
import {MilestoneOverviewCardComponent} from './presentationals/milestone-overview-card/milestone-overview-card.component';
import {MilestoneTitleCaptureComponent} from './presentationals/milestone-title-capture/milestone-title-capture.component';
import {MilestoneTypeLabelComponent} from './presentationals/milestone-type-label/milestone-type-label.component';
import {ProjectCaptureComponent} from './presentationals/project-capture/project-capture.component';
import {ProjectCardComponent} from './presentationals/project-card/project-card.component';
import {ProjectCardContactComponent} from './presentationals/project-card-contact/project-card-contact.component';
import {TaskCardIndicatorsComponent} from './presentationals/task-card-indicators/task-card-indicators.component';
import {TaskCardWeekPlaceholderComponent} from './presentationals/task-card-week-placeholder/task-card-week-placeholder.component';
import {TaskConstraintsCaptureComponent} from './presentationals/task-constraints-capture/task-constraints-capture.component';
import {TaskCraftLabelComponent} from './presentationals/task-craft-label/task-craft-label.component';
import {TaskDetailsComponent} from './presentationals/task-details/task-details.component';
import {TaskLocationLabelComponent} from './presentationals/task-location-label/task-location-label.component';
import {TaskOverviewCardComponent} from './presentationals/task-overview-card/task-overview-card.component';
import {TaskStatusIconComponent} from './presentationals/task-status-icon/task-status-icon.component';
import {ProjectTasksStatusLabelComponent} from './presentationals/tasks-status-label/project-tasks-status-label.component';
import {ActivityEffects} from './store/activities/activity.effects';
import {AttachmentEffects} from './store/attachments/attachment.effects';
import {CalendarEffects} from './store/calendar/calendar/calendar.effects';
import {CalendarScopeEffects} from './store/calendar/calendar-scope/calendar-scope.effects';
import {ConstraintEffects} from './store/constraints/constraint.effects';
import {ProjectCraftEffects} from './store/crafts/project-craft.effects';
import {DayCardEffects} from './store/day-cards/day-card.effects';
import {MessageEffects} from './store/messages/message.effects';
import {MetricsEffects} from './store/metrics/metrics.effects';
import {MilestoneEffects} from './store/milestones/milestone.effects';
import {NewsEffects} from './store/news/news.effects';
import {ProjectParticipantsEffects} from './store/participants/project-participant.effects';
import {ProjectCopyEffects} from './store/project-copy/project-copy.effects';
import {ProjectExportEffects} from './store/project-export/project-export.effects';
import {ProjectImportEffects} from './store/project-import/project-import.effects';
import {ProjectEffects} from './store/projects/project.effects';
import {QuickFilterEffects} from './store/quick-filters/quick-filter.effects';
import {RelationEffects} from './store/relations/relation.effects';
import {RescheduleEffects} from './store/reschedule/reschedule.effects';
import {RfvEffects} from './store/rfvs/rfv.effects';
import {TaskConstraintsEffects} from './store/task-constraints/task-constraints.effects';
import {TaskScheduleEffects} from './store/task-schedules/task-schedule.effects';
import {ProjectTasksEffects} from './store/tasks/task.effects';
import {TopicEffects} from './store/topics/topic.effects';
import {WorkDaysEffects} from './store/work-days/work-days.effects';
import {WorkareaEffects} from './store/workareas/workarea.effects';

@NgModule({
    imports: [
        DragDropModule,
        DrawerModule,
        EffectsModule.forFeature([
            ActivityEffects,
            AttachmentEffects,
            CalendarEffects,
            CalendarScopeEffects,
            ConstraintEffects,
            DayCardEffects,
            MessageEffects,
            MetricsEffects,
            MilestoneEffects,
            NewsEffects,
            ProjectCopyEffects,
            ProjectCraftEffects,
            ProjectEffects,
            ProjectExportEffects,
            ProjectImportEffects,
            ProjectParticipantsEffects,
            ProjectTasksEffects,
            QuickFilterEffects,
            RelationEffects,
            RescheduleEffects,
            RfvEffects,
            TaskConstraintsEffects,
            TaskScheduleEffects,
            TopicEffects,
            WorkareaEffects,
            WorkDaysEffects,
        ]),
        IconModule,
        RouterModule,
        SharedModule,
    ],
    declarations: [
        CalendarExportComponent,
        CommonFilterCaptureComponent,
        CraftLabelComponent,
        DayCardCaptureComponent,
        DayCardComponent,
        DayCardCreateComponent,
        DayCardDetailComponent,
        DayCardEditComponent,
        DayCardIndicatorComponent,
        DayCardLockedComponent,
        DayCardMultipleReasonComponent,
        DayCardReasonCaptureComponent,
        DayCardReasonComponent,
        DayCardStatusComponent,
        DependenciesListComponent,
        MilestoneCaptureComponent,
        MilestoneComponent,
        MilestoneCreationSlotsComponent,
        MilestoneDateLabelComponent,
        MilestoneDetailDrawerComponent,
        MilestoneEditComponent,
        MilestoneFilterCaptureComponent,
        MilestoneLocationLabelComponent,
        MilestoneMarkerComponent,
        MilestoneOverviewCardComponent,
        MilestoneTaskRelationListComponent,
        MilestoneTitleCaptureComponent,
        MilestoneTypeLabelComponent,
        MilestoneTypeOptionsComponent,
        ProjectCaptureComponent,
        ProjectCardComponent,
        ProjectCardContactComponent,
        ProjectFilterCaptureComponent,
        ProjectFilterChipsComponent,
        ProjectFilterDrawerComponent,
        ProjectOverviewCardComponent,
        ProjectRescheduleDrawerComponent,
        ProjectRescheduleReviewComponent,
        ProjectRescheduleShiftCaptureComponent,
        ProjectTasksCaptureComponent,
        ProjectTasksCardAssigneeComponent,
        ProjectTasksStatusLabelComponent,
        QuickFilterCaptureComponent,
        QuickFilterListComponent,
        QuickFilterDrawerComponent,
        TaskCardIndicatorsComponent,
        TaskCardWeekComponent,
        TaskCardWeekPlaceholderComponent,
        TaskConstraintsCaptureComponent,
        TaskConstraintsComponent,
        TaskConstraintsLabelComponent,
        TaskCraftLabelComponent,
        TaskDaycardsComponent,
        TaskDetailsComponent,
        TaskDonutChartComponent,
        TaskLocationLabelComponent,
        TaskMilestoneRelationListComponent,
        TaskOverviewCardComponent,
        TasksFilterCaptureComponent,
        TaskStatusDropdownComponent,
        TaskStatusIconComponent,
        TaskShiftAmountPipe,
    ],
    exports: [
        CalendarExportComponent,
        CommonFilterCaptureComponent,
        CraftLabelComponent,
        DayCardCaptureComponent,
        DayCardComponent,
        DayCardCreateComponent,
        DayCardEditComponent,
        DayCardMultipleReasonComponent,
        DayCardReasonCaptureComponent,
        DayCardReasonComponent,
        DependenciesListComponent,
        MilestoneComponent,
        MilestoneCreationSlotsComponent,
        MilestoneFilterCaptureComponent,
        MilestoneEditComponent,
        ProjectCaptureComponent,
        ProjectCardComponent,
        ProjectCardContactComponent,
        ProjectFilterCaptureComponent,
        ProjectFilterChipsComponent,
        ProjectOverviewCardComponent,
        ProjectRescheduleDrawerComponent,
        ProjectTasksCaptureComponent,
        ProjectTasksCardAssigneeComponent,
        ProjectTasksStatusLabelComponent,
        QuickFilterCaptureComponent,
        QuickFilterDrawerComponent,
        RouterModule,
        SharedModule,
        TaskCardIndicatorsComponent,
        TaskCardWeekComponent,
        TaskCardWeekPlaceholderComponent,
        TaskConstraintsCaptureComponent,
        TaskConstraintsComponent,
        TaskConstraintsLabelComponent,
        TaskCraftLabelComponent,
        TaskDaycardsComponent,
        TaskDetailsComponent,
        TaskDonutChartComponent,
        TaskLocationLabelComponent,
        TaskMilestoneRelationListComponent,
        TaskOverviewCardComponent,
        TasksFilterCaptureComponent,
        TaskStatusIconComponent,
        TaskShiftAmountPipe,
    ],
})
export class ProjectCommonModule {
}
