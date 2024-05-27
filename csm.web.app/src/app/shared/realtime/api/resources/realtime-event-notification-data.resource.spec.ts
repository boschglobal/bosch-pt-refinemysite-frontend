/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    MOCK_REALTIME_NOTIFICATION_EVENT,
    MOCK_REALTIME_NOTIFICATION_SERVER_RESOURCE
} from '../../../../../test/mocks/realtime';
import {RealtimeEventNotificationDataResource} from './realtime-event-notification-data.resource';

describe('Realtime Event Notification Data Resource', () => {
    const data = MOCK_REALTIME_NOTIFICATION_EVENT.data;
    const stringData = MOCK_REALTIME_NOTIFICATION_SERVER_RESOURCE.data;

    it('should return new instance of RealtimeEventNotificationDataResource when calling fromString()', () => {
        const expectedValue = new RealtimeEventNotificationDataResource(data.lastAdded);

        expect(RealtimeEventNotificationDataResource.fromString(stringData)).toEqual(expectedValue);
    });
});
