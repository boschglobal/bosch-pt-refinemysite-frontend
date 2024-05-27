/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {WorkareaResource} from '../api/workareas/resources/workarea.resource';
import {Task} from '../models/tasks/task';

export class TaskSortHelper {

    public static sortForRelationList(tasks: Task[], workareas: WorkareaResource[]): Task[] {
        return [...tasks]
            .sort(this._sortByTaskIdFn)
            .sort(this._sortByTaskNameFn)
            .sort(this._sortByProjectCraftNameFn)
            .sort(this._sortByCompanyNameFn)
            .sort(this.sortByTaskWorkareaPlacementWrapperFn(workareas))
            .sort(this._sortByTaskScheduleEndFn)
            .sort(this._sortByTaskScheduleStartFn);
    }

    public static sortByTaskWorkareaPlacementWrapperFn(workareas: WorkareaResource[]): (a: Task, b: Task) => number {
        return (a: Task, b: Task) => {
            const aWorkareaPosition = workareas.find(workarea => workarea.id === a.workArea?.id)?.position || Number.MAX_VALUE;
            const bWorkareaPosition = workareas.find(workarea => workarea.id === b.workArea?.id)?.position || Number.MAX_VALUE;

            return aWorkareaPosition - bWorkareaPosition;
        };
    }

    private static _sortByTaskIdFn(a: Task, b: Task): number {
        return a.id.localeCompare(b.id);
    }

    private static _sortByTaskNameFn(a: Task, b: Task): number {
        return a.name.localeCompare(b.name);
    }

    private static _sortByProjectCraftNameFn(a: Task, b: Task): number {
        return a.projectCraft.name.localeCompare(b.projectCraft.name);
    }

    private static _sortByCompanyNameFn(a: Task, b: Task): number {
        return (a.company?.displayName || '').localeCompare(b.company?.displayName || '');
    }

    private static _sortByTaskScheduleEndFn(a: Task, b: Task): number {
        return moment(a.schedule.end).isBefore(moment(b.schedule.end)) ? -1 : 1;
    }

    private static _sortByTaskScheduleStartFn(a: Task, b: Task): number {
        return moment(a.schedule.start).isBefore(moment(b.schedule.start)) ? -1 : 1;
    }
}
