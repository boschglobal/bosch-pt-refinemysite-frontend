/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {ResourceWithType} from '../../../shared/misc/api/datatypes/resource-with-type.datatype';
import {ObjectTypeEnum} from '../../../shared/misc/enums/object-type.enum';
import {WorkareaResource} from '../api/workareas/resources/workarea.resource';
import {Milestone} from '../models/milestones/milestone';
import {RelationWithResource} from '../models/relation-with-resource/relation-with-resource';
import {Task} from '../models/tasks/task';
import {MilestoneSortHelper} from './milestone-sort.helper';
import {TaskSortHelper} from './task-sort.helper';

export class CalendarViewItemsSortHelper {

    private static _workareaSortFunctions: WorkareaSortFunctionsByType<Task | Milestone> = {
        [ObjectTypeEnum.Task]: (workareas: WorkareaResource[]) => TaskSortHelper.sortByTaskWorkareaPlacementWrapperFn(workareas),
        [ObjectTypeEnum.Milestone]: (workareas: WorkareaResource[]) => MilestoneSortHelper.sortByWorkareaPlacementWrapperFn(workareas),
    };

    private static _dateSortableAttribute: { [key in ObjectTypeEnum]?: (resource: Task | Milestone) => moment.Moment } = {
        [ObjectTypeEnum.Task]: (task: Task) => moment(task.schedule.start),
        [ObjectTypeEnum.Milestone]: (milestone: Milestone) => milestone.date,
    };

    public static sort(items: CalendarViewItem[], workareas: WorkareaResource[]): CalendarViewItem[] {
        return this._sortItemsByType(items, workareas)
            .sort(this._sortByWorkareaPlacementWrapperFn(workareas))
            .sort(this._sortByDateFn);
    }

    private static _getResourcesByType(items: CalendarViewItem[], type: ObjectTypeEnum): (Task | Milestone)[] {
        return items
            .filter(item => item.type === type)
            .map(item => item.resource);
    }

    private static _mapResourcesToCalendarViewItem(items: CalendarViewItem[], resources: (Task | Milestone)[]): CalendarViewItem[] {
        return resources.map(resource => items.find(item => item.resource.id === resource.id));
    }

    private static _sortByDateFn({type: aType, resource: aResource}: RelationWithResource<Task | Milestone>,
                                 {type: bType, resource: bResource}: RelationWithResource<Task | Milestone>): number {
        const aDate = CalendarViewItemsSortHelper._dateSortableAttribute[aType](aResource);
        const bDate = CalendarViewItemsSortHelper._dateSortableAttribute[bType](bResource);

        return aDate.diff(bDate);
    }

    private static _sortByWorkareaPlacementFn(a: Milestone, b: Task, workareas: WorkareaResource[]): number {
        const aWorkarea = workareas.find(workarea => workarea.id === a.workArea?.id);
        const bWorkarea = workareas.find(workarea => workarea.id === b.workArea?.id);

        const bothOnSameWA = !!aWorkarea && !!bWorkarea && aWorkarea.position === bWorkarea.position;
        const bothWithoutWA = !a.header && !aWorkarea && !bWorkarea;
        const aWorkareaPositionOnUIHigherThenB = !!aWorkarea && aWorkarea.position < (bWorkarea?.position || Number.MAX_VALUE);
        const aBeforeB = a.header || aWorkareaPositionOnUIHigherThenB ? -1 : 1;

        return bothOnSameWA || bothWithoutWA
            ? -1
            : aBeforeB;
    }

    private static _sortByWorkareaPlacementWrapperFn(workareas: WorkareaResource[]): (a: CalendarViewItem, b: CalendarViewItem) => number {
        return ({type: aType, resource: aResource}, {type: bType, resource: bResource}) => {
            if (aType === bType) {
                return CalendarViewItemsSortHelper._workareaSortFunctions[aType](workareas)(aResource, bResource);
            } else {
                const milestone = (aType === ObjectTypeEnum.Milestone ? aResource : bResource) as Milestone;
                const task = (aType === ObjectTypeEnum.Task ? aResource : bResource) as Task;

                return this._sortByWorkareaPlacementFn(milestone, task, workareas);
            }
        };
    }

    private static _sortItemsByType(items: CalendarViewItem[], workareas: WorkareaResource[]): CalendarViewItem[] {
        const tasks = this._getResourcesByType(items, ObjectTypeEnum.Task) as Task[];
        const milestones = this._getResourcesByType(items, ObjectTypeEnum.Milestone) as Milestone[];
        const sortedTasks = TaskSortHelper.sortForRelationList(tasks, workareas);
        const sortedMilestones = MilestoneSortHelper.sortByCalendarView(milestones, workareas);

        return [
            ...this._mapResourcesToCalendarViewItem(items, sortedTasks),
            ...this._mapResourcesToCalendarViewItem(items, sortedMilestones),
        ];
    }
}

export type CalendarViewItem = ResourceWithType<Task | Milestone>;

type WorkareaSortFunctionsByType<T> = {
    [key in ObjectTypeEnum]?: (workareas: WorkareaResource[]) => (a: T, b: T) => number
};
