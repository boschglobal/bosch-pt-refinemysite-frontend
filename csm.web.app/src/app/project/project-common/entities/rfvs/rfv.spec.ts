/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {MOCK_RFV_WITH_UPDATE_PERMISSION} from '../../../../../test/mocks/rfvs';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {RfvEntity} from './rfv';

describe('RFV Entity', () => {

    it('should return a RFV entity from a RFV resource when fromRfvResource is called', () => {
        const {name, key, active, _links} = MOCK_RFV_WITH_UPDATE_PERMISSION;

        const expectedRfvEntity = {
            name,
            key,
            active,
            id: key,
            requestStatus: RequestStatusEnum.empty,
            permissions: {
                canActivate: _links.hasOwnProperty('activate'),
                canDeactivate: _links.hasOwnProperty('deactivate'),
                canUpdate: _links.hasOwnProperty('update'),
            },
        };

        expect(RfvEntity.fromRfvResource(MOCK_RFV_WITH_UPDATE_PERMISSION)).toEqual(expectedRfvEntity);
    });
});
