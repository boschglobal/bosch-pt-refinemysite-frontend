/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {MOCK_PAT_RESOURCE} from '../../../../../../test/mocks/pat';
import {PATResource} from '../../../../../project/project-common/api/pats/resources/pat.resource';
import {PatScopeEnum} from '../../../../user-common/enums/pat.enum';
import {PatContentModel} from './pat-content.model';

describe('PAT Content Model', () => {

    const patResource: PATResource = MOCK_PAT_RESOURCE;
    const patContentModel: PatContentModel = {
        description: MOCK_PAT_RESOURCE.description,
        expiresAt: MOCK_PAT_RESOURCE.expiresAt,
        id: MOCK_PAT_RESOURCE.id,
        options:  MOCK_PAT_RESOURCE.id,
        scopes: MOCK_PAT_RESOURCE.scopes.map(scope => PatScopeEnum[scope]).join(', '),
    };

    it('should return a PAT Content Model with correct data from a PAT Resource', () => {
        expect(PatContentModel.fromPATResource(
            patResource
        )).toEqual(patContentModel);
    });
});
