/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NOTIFICATION_MOCK} from '../../../../test/mocks/notifications';
import {TasksCalendarUrlQueryParamsEnum} from '../../../project/project-common/helpers/tasks-calendar-url-query-params.helper';
import {TasksCalendarFocusParams} from '../../../project/project-common/models/tasks-calendar-focus-params/tasks-calendar-focus-params';
import {ProjectUrlRetriever} from '../../../project/project-routing/helper/project-url-retriever';
import {
    PROJECT_ROUTE_PATHS,
    TASK_DETAIL_OUTLET_NAME,
    TASK_WORKFLOW_OUTLET_NAME
} from '../../../project/project-routing/project-route.paths';
import {ObjectIdentifierPair} from '../../misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../misc/enums/object-type.enum';
import {NotificationNavigationHelper} from './notification-navigation.helper';

describe('Notification Navigation Helper', () => {
    const helper = new NotificationNavigationHelper();

    const notificationDayCardMock = Object.assign({}, NOTIFICATION_MOCK, {
        object: new ObjectIdentifierPair(ObjectTypeEnum.DayCard, '017da74c-42f0-4644-b5bc-a3fc5fcfc868'),
    });

    const notificationTaskMock = Object.assign({}, NOTIFICATION_MOCK, {
        object: new ObjectIdentifierPair(ObjectTypeEnum.Task, '017da74c-42f0-4644-b5bc-a3fc5fcfc868'),
    });

    it('should get correct url for a DayCardNotification', () => {
        const expectedResult = [ProjectUrlRetriever.getProjectCalendarUrl(notificationDayCardMock.context.project.id)];

        expect(helper.getUrl(notificationDayCardMock)).toEqual(expectedResult);
    });

    it('should get correct url for a TaskNotification', () => {
        const expectedResult = [
            ProjectUrlRetriever.getProjectTaskDetailUrl(notificationTaskMock.context.project.id, notificationTaskMock.context.task.id),
            {
                outlets: {
                    [TASK_DETAIL_OUTLET_NAME]: PROJECT_ROUTE_PATHS.information,
                    [TASK_WORKFLOW_OUTLET_NAME]: PROJECT_ROUTE_PATHS.taskTopics,
                },
            },
        ];

        expect(helper.getUrl(notificationTaskMock)).toEqual(expectedResult);
    });

    it('should return null url query parameters for a notification type different then a DayCardNotification', () => {
        const notification = Object.assign({}, NOTIFICATION_MOCK, {
            object: new ObjectIdentifierPair(null, null),
        });
        expect(helper.getQueryParams(notification)).toBeNull();
    });

    it('should return the correct url query parameters for a DayCardNotification', () => {
        const taskId = notificationDayCardMock.context.task.id;
        const dayCardId = notificationDayCardMock.object.identifier;
        const focusParams = new TasksCalendarFocusParams(ObjectTypeEnum.DayCard, [taskId, dayCardId]);
        const expectedResult = {
            [TasksCalendarUrlQueryParamsEnum.Focus]: focusParams.toString(),
        };

        expect(helper.getQueryParams(notificationDayCardMock)).toEqual(expectedResult);
    });
});
