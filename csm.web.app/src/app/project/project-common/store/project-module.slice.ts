/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {ActivitySlice} from './activities/activity.slice';
import {AttachmentSlice} from './attachments/attachment.slice';
import {CalendarModuleSlice} from './calendar/calendar-module.slice';
import {ConstraintSlice} from './constraints/constraint.slice';
import {ProjectCraftSlice} from './crafts/project-craft.slice';
import {DayCardSlice} from './day-cards/day-card.slice';
import {MessageSlice} from './messages/message.slice';
import {MetricsSlice} from './metrics/metrics.slice';
import {MilestoneSlice} from './milestones/milestone.slice';
import {NewsSlice} from './news/news.slice';
import {ProjectParticipantSlice} from './participants/project-participant.slice';
import {ProjectCopySlice} from './project-copy/project-copy.slice';
import {ProjectExportSlice} from './project-export/project-export.slice';
import {ProjectImportSlice} from './project-import/project-import.slice';
import {ProjectSlice} from './projects/project.slice';
import {QuickFilterSlice} from './quick-filters/quick-filter.slice';
import {RelationSlice} from './relations/relation.slice';
import {RescheduleSlice} from './reschedule/reschedule.slice';
import {RfvSlice} from './rfvs/rfv.slice';
import {TaskConstraintsSlice} from './task-constraints/task-constraints.slice';
import {TaskScheduleSlice} from './task-schedules/task-schedule.slice';
import {ProjectTaskSlice} from './tasks/task.slice';
import {TopicSlice} from './topics/topic.slice';
import {WorkDaysSlice} from './work-days/work-days.slice';
import {WorkareaSlice} from './workareas/workarea.slice';

export interface ProjectModuleSlice {
    activitySlice: ActivitySlice;
    attachmentSlice: AttachmentSlice;
    calendarModule: CalendarModuleSlice;
    constraintSlice: ConstraintSlice;
    dayCardSlice: DayCardSlice;
    messageSlice: MessageSlice;
    metricsSlice: MetricsSlice;
    milestoneSlice: MilestoneSlice;
    newsSlice: NewsSlice;
    projectCopySlice: ProjectCopySlice;
    projectCraftSlice: ProjectCraftSlice;
    projectExportSlice: ProjectExportSlice;
    projectImportSlice: ProjectImportSlice;
    projectParticipantSlice: ProjectParticipantSlice;
    projectSlice: ProjectSlice;
    projectTaskSlice: ProjectTaskSlice;
    quickFilterSlice: QuickFilterSlice;
    relationSlice: RelationSlice;
    rescheduleSlice: RescheduleSlice;
    rfvSlice: RfvSlice;
    taskConstraintsSlice: TaskConstraintsSlice;
    taskScheduleSlice: TaskScheduleSlice;
    topicSlice: TopicSlice;
    workareaSlice: WorkareaSlice;
    workDaysSlice: WorkDaysSlice;
}
