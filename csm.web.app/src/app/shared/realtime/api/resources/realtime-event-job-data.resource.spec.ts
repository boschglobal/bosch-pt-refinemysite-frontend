/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    MOCK_REALTIME_JOB_EVENT,
    MOCK_REALTIME_JOB_SERVER_RESOURCE,
} from '../../../../../test/mocks/realtime';
import {RealtimeEventJobDataResource} from './realtime-event-job-data.resource';

describe('Realtime Event Job Data Resource', () => {
    const data = MOCK_REALTIME_JOB_EVENT.data;
    const stringData = MOCK_REALTIME_JOB_SERVER_RESOURCE.data;

    it('should return new instance of RealtimeEventJobDataResource when calling fromString()', () => {
        const expectedValue = new RealtimeEventJobDataResource(data);

        expect(RealtimeEventJobDataResource.fromString(stringData)).toEqual(expectedValue);
    });
});
