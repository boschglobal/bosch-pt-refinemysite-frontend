/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import * as moment from 'moment/moment';

import {DateParserStrategy} from '../../../shared/ui/dates/date-parser.strategy';
import {WORKAREA_UUID_EMPTY} from '../constants/workarea.constant';
import {TopicCriticalityEnum} from '../enums/topic-criticality.enum';
import {Task} from '../models/tasks/task';
import {ProjectTaskFiltersCriteria} from '../store/tasks/slice/project-task-filters-criteria';

@Injectable({
    providedIn: 'root',
})
export class TaskFiltersHelper {

    constructor(private readonly _dateParser: DateParserStrategy) {
    }

    public matchTask(task: Task, criteria: ProjectTaskFiltersCriteria): boolean {
        return this.matchTaskStatus(task, criteria)
            && this.matchTaskProjectCraft(task, criteria)
            && this.matchTaskWorkArea(task, criteria)
            && this.matchTaskAssignees(task, criteria)
            && this.matchTaskScope(task, criteria)
            && this.matchTaskTopics(task, criteria)
            && this.matchTaskCriticalTopics(task, criteria);
    }

    public matchTaskStatus(task: Task, {status}: ProjectTaskFiltersCriteria): boolean {
        return status.length === 0 || status.includes(task.status);
    }

    public matchTaskProjectCraft(task: Task, {projectCraftIds}: ProjectTaskFiltersCriteria): boolean {
        return projectCraftIds.length === 0 || projectCraftIds.includes(task.projectCraft.id);
    }

    public matchTaskWorkArea(task: Task, {workAreaIds}: ProjectTaskFiltersCriteria): boolean {
        return workAreaIds.length === 0 || workAreaIds.includes(task.workArea?.id || WORKAREA_UUID_EMPTY);
    }

    public matchTaskAssignees(task: Task, {assignees: {companyIds, participantIds}}: ProjectTaskFiltersCriteria): boolean {
        return (companyIds.length === 0 && participantIds.length === 0)
            || companyIds.includes(task.company?.id)
            || participantIds.includes(task.assignee?.id);
    }

    public matchTaskScope(task: Task, criteria: ProjectTaskFiltersCriteria): boolean {
        const {from, to, allDaysInDateRange} = criteria;

        return (!from && !to)
            || (allDaysInDateRange
                ? this._matchTaskScopeWithAllDaysInDateRange(task, criteria)
                : this._matchTaskScopeWithoutAllDaysInDateRange(task, criteria));
    }

    public matchTaskTopics(task: Task, {hasTopics}: ProjectTaskFiltersCriteria): boolean {
        return !hasTopics || task.statistics.criticalTopics > 0 || task.statistics.uncriticalTopics > 0;
    }

    public matchTaskCriticalTopics(task: Task, {topicCriticality}: ProjectTaskFiltersCriteria): boolean {
        return topicCriticality.length === 0
            || (topicCriticality.includes(TopicCriticalityEnum.CRITICAL) && task.statistics.criticalTopics > 0);
    }

    private _matchTaskScopeWithAllDaysInDateRange({schedule: {start, end}}: Task, {from, to}: ProjectTaskFiltersCriteria): boolean {
        return (!!from && !!to && moment(start).isSameOrAfter(from, 'd') && moment(end).isSameOrBefore(to, 'd'))
            || (!from && !!to && moment(end).isSameOrBefore(to, 'd'))
            || (!!from && !to && moment(start).isSameOrAfter(from, 'd'));
    }

    private _matchTaskScopeWithoutAllDaysInDateRange({schedule: {start, end}}: Task, {from, to}: ProjectTaskFiltersCriteria): boolean {
        const taskStartsBeforeEnd = !from && !!to && this._dateParser.isSameOrBefore(moment(start), to, 'w');
        const taskEndsAfterStart = !!from && !to && this._dateParser.isSameOrAfter(moment(end), from, 'w');
        const taskWithinStartAndEnd = !!from && !!to
            && this._dateParser.isSameOrAfter(moment(end), from, 'w')
            && this._dateParser.isSameOrBefore(moment(start), to, 'w');

        return taskWithinStartAndEnd || taskEndsAfterStart || taskStartsBeforeEnd;
    }
}
