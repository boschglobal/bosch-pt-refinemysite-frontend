/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

export const ROUTE_PARAM_PARTICIPANT_ID = 'participantId';
export const ROUTE_PARAM_PROJECT_ID = 'projectId';
export const ROUTE_PARAM_TASK_ID = 'taskId';
export const TASK_WORKFLOW_OUTLET_NAME = 'task-workflow';
export const TASK_DETAIL_OUTLET_NAME = 'task-detail';

export const PROJECT_ROUTE_PATHS: any = {
    calendar: 'calendar',
    calendarOldPath: 'tasks/calendar', // TODO: SMAR-8825 Remove old calendar route after user adoption
    crafts: 'crafts',
    create: 'create',
    dashboard: 'dashboard',
    edit: 'edit',
    information: 'information',
    list: 'list',
    participants: 'participants',
    participantId: `:${ROUTE_PARAM_PARTICIPANT_ID}`,
    projects: 'projects',
    projectId: `:${ROUTE_PARAM_PROJECT_ID}`,
    settings: 'settings',
    settingsRfv: 'rfv',
    settingsConstraints: 'constraints',
    settingsWorkingDays: 'workingdays',
    tasks: 'tasks',
    taskActivities: 'activities',
    taskAttachments: 'attachments',
    taskId: `:${ROUTE_PARAM_TASK_ID}`,
    taskTopics: 'topics',
    taskInformation: 'information',
    workareas: 'workareas',
    kpis: 'kpis',
    ppc: 'ppc',
    rfv: 'rvf',
};
