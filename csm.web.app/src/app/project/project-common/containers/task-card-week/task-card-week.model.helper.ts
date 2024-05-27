/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import * as moment from 'moment';

import {TimeScope} from '../../../../shared/misc/api/datatypes/time-scope.datatype';
import {CRAFT_COLORS} from '../../../../shared/ui/constants/colors.constant';
import {DateParserStrategy} from '../../../../shared/ui/dates/date-parser.strategy';
import {NewsResource} from '../../api/news/resources/news.resource';
import {TaskConstraintsResource} from '../../api/task-constraints/resources/task-constraints.resource';
import {TaskStatistics} from '../../api/tasks/resources/task.resource';
import {TaskCardDescriptionTypeEnum} from '../../enums/task-card-description-type.enum';
import {TaskStatusEnum} from '../../enums/task-status.enum';
import {TaskSchedulePermissions} from '../../models/task-schedules/task-schedule';
import {Task} from '../../models/tasks/task';

export const TASK_CARD_DESCRIPTION_BY_TYPE: {[key in TaskCardDescriptionTypeEnum]: (task: Task) => string } = {
    [TaskCardDescriptionTypeEnum.Company]: (task: Task) => task.company?.displayName ?? '---',
    [TaskCardDescriptionTypeEnum.Assignee]: (task: Task) => task.assignee?.displayName ?? '---',
    [TaskCardDescriptionTypeEnum.Craft]: (task: Task) => task.projectCraft.name,
};

@Injectable({
    providedIn: 'root',
})
export class TaskCardWeekModelHelper {

    constructor(private _dateParser: DateParserStrategy) {
    }

    public fromTaskWithScopeNewsAndDescriptionType(task: Task,
                                                   scope: TimeScope,
                                                   taskCardDescriptionType: TaskCardDescriptionTypeEnum,
                                                   news: NewsResource[] = []): TaskCardWeekModel {
        const {id, name: title, status, constraints, statistics, schedule: {start: taskStart, end: taskEnd, permissions}} = task;
        const {start: calendarStart, end: calendarEnd} = scope;
        const {solid: solidColor, light: lightColor} = CRAFT_COLORS.find(color => color.solid === task.projectCraft.color) || {};
        const start = moment(taskStart);
        const end = moment(taskEnd);
        const description = TASK_CARD_DESCRIPTION_BY_TYPE[taskCardDescriptionType](task);
        const hasNews = !!news.length;

        return {
            id,
            title,
            status,
            description,
            solidColor,
            lightColor,
            start,
            end,
            calendarStart,
            calendarEnd,
            permissions,
            constraints,
            statistics,
            cardStart: this._dateParser.startOfWeek(moment.max(start, calendarStart)),
            cardEnd: this._dateParser.endOfWeek(moment.min(end, calendarEnd)),
            hasNews,
        };
    }
}

export class TaskCardWeekModel {
    public id: string;
    public title: string;
    public status: TaskStatusEnum;
    public description: string;
    public solidColor: string;
    public lightColor: string;
    public start: moment.Moment;
    public end: moment.Moment;
    public calendarStart: moment.Moment;
    public calendarEnd: moment.Moment;
    public permissions: TaskSchedulePermissions;
    public cardStart: moment.Moment;
    public cardEnd: moment.Moment;
    public constraints: TaskConstraintsResource;
    public statistics: TaskStatistics;
    public hasNews: boolean;
}
