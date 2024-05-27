/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {ACTIVITY_SLICE_INITIAL_STATE} from './activities/activity.initial-state';
import {ATTACHMENT_SLICE_INITIAL_STATE} from './attachments/attachment.initial-state';
import {CALENDAR_MODULE_INITIAL_STATE} from './calendar/calendar-module.initial-state';
import {CONSTRAINT_INITIAL_STATE} from './constraints/constraint.initial-state';
import {PROJECT_CRAFT_SLICE_INITIAL_STATE} from './crafts/project-craft.initial-state';
import {DAY_CARD_SLICE_INITIAL_STATE} from './day-cards/day-card.initial-state';
import {MESSAGE_SLICE_INITIAL_STATE} from './messages/message.initial-state';
import {METRICS_SLICE_INITIAL_STATE} from './metrics/metrics.initial-state';
import {MILESTONE_SLICE_INITIAL_STATE} from './milestones/milestone.initial-state';
import {NEWS_SLICE_INITIAL_STATE} from './news/news.initial-state';
import {PROJECT_PARTICIPANT_SLICE_INITIAL_STATE} from './participants/project-participant.initial-state';
import {PROJECT_COPY_SLICE_INITIAL_STATE} from './project-copy/project-copy.initial-state';
import {PROJECT_EXPORT_INITIAL_STATE} from './project-export/project-export.initial-state';
import {PROJECT_IMPORT_INITIAL_STATE} from './project-import/project-import.initial-state';
import {ProjectModuleSlice} from './project-module.slice';
import {PROJECT_SLICE_INITIAL_STATE} from './projects/project.initial-state';
import {QUICK_FILTER_SLICE_INITIAL_STATE} from './quick-filters/quick-filter.initial-state';
import {RELATION_INITIAL_STATE} from './relations/relation.initial-state';
import {RESCHEDULE_SLICE_INITIAL_STATE} from './reschedule/reschedule.initial-state';
import {RFV_SLICE_INITIAL_STATE} from './rfvs/rfv.initial-state';
import {TASK_CONSTRAINTS_INITIAL_STATE} from './task-constraints/task-constraints.initial-state';
import {TASK_SCHEDULE_SLICE_INITIAL_STATE} from './task-schedules/task-schedule.initial-state';
import {PROJECT_TASK_SLICE_INITIAL_STATE} from './tasks/task.initial-state';
import {TOPIC_SLICE_INITIAL_STATE} from './topics/topic.initial-state';
import {WORK_DAYS_INITIAL_STATE} from './work-days/work-days.initial-state';
import {WORKAREA_SLICE_INITIAL_STATE} from './workareas/workarea.initial-state';

export const PROJECT_MODULE_INITIAL_STATE: ProjectModuleSlice = {
    activitySlice: ACTIVITY_SLICE_INITIAL_STATE,
    attachmentSlice: ATTACHMENT_SLICE_INITIAL_STATE,
    calendarModule: CALENDAR_MODULE_INITIAL_STATE,
    constraintSlice: CONSTRAINT_INITIAL_STATE,
    dayCardSlice: DAY_CARD_SLICE_INITIAL_STATE,
    messageSlice: MESSAGE_SLICE_INITIAL_STATE,
    metricsSlice: METRICS_SLICE_INITIAL_STATE,
    milestoneSlice: MILESTONE_SLICE_INITIAL_STATE,
    newsSlice: NEWS_SLICE_INITIAL_STATE,
    projectCopySlice: PROJECT_COPY_SLICE_INITIAL_STATE,
    projectCraftSlice: PROJECT_CRAFT_SLICE_INITIAL_STATE,
    projectExportSlice: PROJECT_EXPORT_INITIAL_STATE,
    projectImportSlice: PROJECT_IMPORT_INITIAL_STATE,
    projectParticipantSlice: PROJECT_PARTICIPANT_SLICE_INITIAL_STATE,
    projectSlice: PROJECT_SLICE_INITIAL_STATE,
    projectTaskSlice: PROJECT_TASK_SLICE_INITIAL_STATE,
    quickFilterSlice: QUICK_FILTER_SLICE_INITIAL_STATE,
    relationSlice: RELATION_INITIAL_STATE,
    rescheduleSlice: RESCHEDULE_SLICE_INITIAL_STATE,
    rfvSlice: RFV_SLICE_INITIAL_STATE,
    taskConstraintsSlice: TASK_CONSTRAINTS_INITIAL_STATE,
    taskScheduleSlice: TASK_SCHEDULE_SLICE_INITIAL_STATE,
    topicSlice: TOPIC_SLICE_INITIAL_STATE,
    workareaSlice: WORKAREA_SLICE_INITIAL_STATE,
    workDaysSlice: WORK_DAYS_INITIAL_STATE,
};
