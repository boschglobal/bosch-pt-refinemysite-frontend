/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */
import {
    ActionReducer,
    combineReducers
} from '@ngrx/store';

import {ACTIVITY_REDUCER} from './activities/activity.reducer';
import {ATTACHMENT_REDUCER} from './attachments/attachment.reducer';
import {CALENDAR_MODULE_REDUCER} from './calendar/calendar-module.reducer';
import {CONSTRAINT_REDUCER} from './constraints/constraint.reducer';
import {PROJECT_CRAFT_REDUCER} from './crafts/project-craft.reducer';
import {DAY_CARD_REDUCER} from './day-cards/day-card.reducer';
import {MESSAGE_REDUCER} from './messages/message.reducer';
import {METRICS_REDUCER} from './metrics/metrics.reducer';
import {MILESTONE_REDUCER} from './milestones/milestone.reducer';
import {NEWS_REDUCER} from './news/news.reducer';
import {PROJECT_PARTICIPANT_REDUCER} from './participants/project-participant.reducer';
import {PROJECT_COPY_REDUCER} from './project-copy/project-copy.reducer';
import {PROJECT_EXPORT_REDUCER} from './project-export/project-export.reducer';
import {PROJECT_IMPORT_REDUCER} from './project-import/project-import.reducer';
import {ProjectModuleSlice} from './project-module.slice';
import {PROJECT_REDUCER} from './projects/project.reducer';
import {QUICK_FILTER_REDUCER} from './quick-filters/quick-filter.reducer';
import {RELATION_REDUCER} from './relations/relation.reducer';
import {RESCHEDULE_REDUCER} from './reschedule/reschedule.reducer';
import {RFV_REDUCER} from './rfvs/rfv.reducer';
import {TASK_CONSTRAINT_REDUCER} from './task-constraints/task-constraints.reducer';
import {TASK_SCHEDULE_REDUCER} from './task-schedules/task-schedule.reducer';
import {PROJECT_TASK_REDUCER} from './tasks/task.reducer';
import {TOPIC_REDUCER} from './topics/topic.reducer';
import {WORK_DAYS_REDUCER} from './work-days/work-days.reducer';
import {WORKAREA_REDUCER} from './workareas/workarea.reducer';

export const PROJECT_MODULE_REDUCERS = {
    activitySlice: ACTIVITY_REDUCER,
    attachmentSlice: ATTACHMENT_REDUCER,
    calendarModule: CALENDAR_MODULE_REDUCER,
    constraintSlice: CONSTRAINT_REDUCER,
    dayCardSlice: DAY_CARD_REDUCER,
    messageSlice: MESSAGE_REDUCER,
    metricsSlice: METRICS_REDUCER,
    milestoneSlice: MILESTONE_REDUCER,
    newsSlice: NEWS_REDUCER,
    projectCopySlice: PROJECT_COPY_REDUCER,
    projectCraftSlice: PROJECT_CRAFT_REDUCER,
    projectExportSlice: PROJECT_EXPORT_REDUCER,
    projectImportSlice: PROJECT_IMPORT_REDUCER,
    projectParticipantSlice: PROJECT_PARTICIPANT_REDUCER,
    projectSlice: PROJECT_REDUCER,
    projectTaskSlice: PROJECT_TASK_REDUCER,
    quickFilterSlice: QUICK_FILTER_REDUCER,
    relationSlice: RELATION_REDUCER,
    rescheduleSlice: RESCHEDULE_REDUCER,
    rfvSlice: RFV_REDUCER,
    taskConstraintsSlice: TASK_CONSTRAINT_REDUCER,
    taskScheduleSlice: TASK_SCHEDULE_REDUCER,
    topicSlice: TOPIC_REDUCER,
    workareaSlice: WORKAREA_REDUCER,
    workDaysSlice: WORK_DAYS_REDUCER,
};

export const PROJECT_MODULE_REDUCER: ActionReducer<ProjectModuleSlice> = combineReducers(PROJECT_MODULE_REDUCERS);
