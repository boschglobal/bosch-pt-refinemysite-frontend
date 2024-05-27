/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';

import {TasksCalendarUrlQueryParamsEnum} from '../../../project/project-common/helpers/tasks-calendar-url-query-params.helper';
import {TasksCalendarFocusParams} from '../../../project/project-common/models/tasks-calendar-focus-params/tasks-calendar-focus-params';
import {ProjectUrlRetriever} from '../../../project/project-routing/helper/project-url-retriever';
import {
    PROJECT_ROUTE_PATHS,
    TASK_DETAIL_OUTLET_NAME,
    TASK_WORKFLOW_OUTLET_NAME
} from '../../../project/project-routing/project-route.paths';
import {ObjectTypeEnum} from '../../misc/enums/object-type.enum';
import {NotificationResource} from '../api/resources/notification.resource';

@Injectable({
    providedIn: 'root',
})
export class NotificationNavigationHelper {

    public getUrl(notification: NotificationResource): any[] {
        return notification.object.type === ObjectTypeEnum.DayCard
            ? this._getUrlForDaycard(notification)
            : this._getUrlForTask(notification);
    }

    public getQueryParams(notification: NotificationResource): { [key: string]: any } {
        return notification.object.type === ObjectTypeEnum.DayCard ? this._getQueryParamsForDayCard(notification) : null;
    }

    private _getUrlForTask(notification: NotificationResource): any[] {
        return [
            ProjectUrlRetriever.getProjectTaskDetailUrl(notification.context.project.id, notification.context.task.id),
            {
                outlets: {
                    [TASK_DETAIL_OUTLET_NAME]: PROJECT_ROUTE_PATHS.information,
                    [TASK_WORKFLOW_OUTLET_NAME]: PROJECT_ROUTE_PATHS.taskTopics,
                },
            },
        ];
    }

    private _getUrlForDaycard(notification: NotificationResource): any[] {
        return [ProjectUrlRetriever.getProjectCalendarUrl(notification.context.project.id)];
    }

    private _getQueryParamsForDayCard(notification: NotificationResource): { [key: string]: any } {
        const taskId = notification.context.task.id;
        const dayCardId = notification.object.identifier;
        const focusParams = new TasksCalendarFocusParams(ObjectTypeEnum.DayCard, [taskId, dayCardId]);

        return {
            [TasksCalendarUrlQueryParamsEnum.Focus]: focusParams.toString(),
        };
    }
}
