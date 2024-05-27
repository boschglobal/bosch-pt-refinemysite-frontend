/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {WorkareaResource} from '../api/workareas/resources/workarea.resource';
import {Milestone} from '../models/milestones/milestone';
import {RelationWithResource} from '../models/relation-with-resource/relation-with-resource';
import {Task} from '../models/tasks/task';
import {
    CalendarViewItem,
    CalendarViewItemsSortHelper,
} from './calendar-view-items-sort.helper';

export class DependenciesSortHelper {

    public static sort(relations: RelationWithResource<Task | Milestone>[],
                       workareas: WorkareaResource[]): RelationWithResource<Task | Milestone>[] {
        const calendarViewItems = DependenciesSortHelper._mapRelationsToCalendarViewItems(relations);
        const sortedCalendarViewItems = CalendarViewItemsSortHelper.sort(calendarViewItems, workareas);

        return DependenciesSortHelper._mapCalendarViewItemsToRelations(relations, sortedCalendarViewItems);
    }

    private static _mapRelationsToCalendarViewItems(relations: RelationWithResource<Task | Milestone>[]): CalendarViewItem[] {
        return relations.map(relation => ({type: relation.type, resource: relation.resource}));
    }

    private static _mapCalendarViewItemsToRelations(relations: RelationWithResource<Task | Milestone>[],
                                                    items: CalendarViewItem[]): RelationWithResource<Task | Milestone>[] {
        return items.map(({resource}) => relations.find(relation => relation.resource.id === resource.id));
    }
}
