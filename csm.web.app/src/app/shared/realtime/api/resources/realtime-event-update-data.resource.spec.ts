/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {cloneDeep} from 'lodash';

import {
    MOCK_REALTIME_UPDATE_EVENT,
} from '../../../../../test/mocks/realtime';
import {RealtimeEventUpdateDataResource} from './realtime-event-update-data.resource';

describe('Realtime Event Update Data Resource', () => {
    const dataWithIdentifiers = cloneDeep(MOCK_REALTIME_UPDATE_EVENT.data);
    delete dataWithIdentifiers.root.id;
    delete dataWithIdentifiers.object.id;
    const stringDataWithIdentifiers = JSON.stringify(dataWithIdentifiers);

    it('should return new instance of RealtimeEventUpdateDataResource when calling fromString() for event using "identifier"', () => {
        const {event, root, object} = MOCK_REALTIME_UPDATE_EVENT.data;
        const expectedValue = new RealtimeEventUpdateDataResource(event, root, object);

        expect(RealtimeEventUpdateDataResource.fromString(stringDataWithIdentifiers)).toEqual(expectedValue);
    });
});
