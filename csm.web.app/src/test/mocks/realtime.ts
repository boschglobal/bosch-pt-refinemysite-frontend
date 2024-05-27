/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {ObjectIdentifierPair} from '../../app/shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectIdentifierPairWithVersion} from '../../app/shared/misc/api/datatypes/object-identifier-pair-with-version.datatype';
import {ObjectTypeEnum} from '../../app/shared/misc/enums/object-type.enum';
import {RealtimeEventJobDataResource} from '../../app/shared/realtime/api/resources/realtime-event-job-data.resource';
import {RealtimeEventNotificationDataResource} from '../../app/shared/realtime/api/resources/realtime-event-notification-data.resource';
import {RealtimeEventUpdateDataResource} from '../../app/shared/realtime/api/resources/realtime-event-update-data.resource';
import {EventTypeEnum} from '../../app/shared/realtime/enums/event-type.enum';
import {RealtimeEventTypeEnum} from '../../app/shared/realtime/enums/realtime-event-type.enum';
import {JOB_MOCK_1} from './jobs';

export const MOCK_REALTIME_UPDATE_EVENT = {
    type: RealtimeEventTypeEnum.Update,
    data: new RealtimeEventUpdateDataResource(
        EventTypeEnum.Created,
        new ObjectIdentifierPair(ObjectTypeEnum.Topic, '123'),
        new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Task, '456', 1),
    ),
};

export const MOCK_REALTIME_NOTIFICATION_EVENT = {
    type: RealtimeEventTypeEnum.Notification,
    data: new RealtimeEventNotificationDataResource(new Date('01/20/1989').toISOString()),
};

export const MOCK_REALTIME_JOB_EVENT = {
    type: RealtimeEventTypeEnum.Job,
    data: new RealtimeEventJobDataResource(JOB_MOCK_1).job,
};

export const MOCK_REALTIME_UPDATE_SERVER_RESOURCE = {
    type: MOCK_REALTIME_UPDATE_EVENT.type,
    data: JSON.stringify(MOCK_REALTIME_UPDATE_EVENT.data),
};

export const MOCK_REALTIME_NOTIFICATION_SERVER_RESOURCE = {
    type: MOCK_REALTIME_NOTIFICATION_EVENT.type,
    data: JSON.stringify(MOCK_REALTIME_NOTIFICATION_EVENT.data),
};

export const MOCK_REALTIME_JOB_SERVER_RESOURCE = {
    type: MOCK_REALTIME_JOB_EVENT.type,
    data: JSON.stringify(MOCK_REALTIME_JOB_EVENT.data),
};
