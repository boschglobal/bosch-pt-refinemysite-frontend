/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {MOCK_CONSTRAINT_WITH_UPDATE_PERMISSION} from '../../../../../test/mocks/constraints';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ConstraintEntity} from './constraint';

describe('Constraint Entity', () => {

    it('should return a Constraint Entity from a Constraint Resource when fromConstraintResource is called', () => {
        const {name, key, active, _links} = MOCK_CONSTRAINT_WITH_UPDATE_PERMISSION;

        const expectedConstraintEntity = {
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

        expect(ConstraintEntity.fromConstraintResource(MOCK_CONSTRAINT_WITH_UPDATE_PERMISSION)).toEqual(expectedConstraintEntity);
    });
});
