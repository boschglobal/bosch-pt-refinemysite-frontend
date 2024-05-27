/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {MOCK_RELATION_RESOURCE_1} from '../../../../../test/mocks/relations';
import {MOCK_TASK} from '../../../../../test/mocks/tasks';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RelationResource} from '../../api/relations/resources/relation.resource';
import {Task} from '../tasks/task';
import {RelationWithResource} from './relation-with-resource';

describe('Relation with Resource', () => {

    it('should return a RelationWithResource from a Task and Relation Resource when fromRelationAndResource is called', () => {
        const {id, version, critical, _links}: RelationResource = MOCK_RELATION_RESOURCE_1;
        const type = ObjectTypeEnum.Task;
        const expectedResult: RelationWithResource<Task> = {
            id,
            version,
            critical,
            type,
            resource: MOCK_TASK,
            permissions: {
                canDelete: _links.hasOwnProperty('delete'),
            },
        };

        expect(RelationWithResource.fromRelationAndResource<Task>(MOCK_TASK, MOCK_RELATION_RESOURCE_1, type)).toEqual(expectedResult);
    });
});
