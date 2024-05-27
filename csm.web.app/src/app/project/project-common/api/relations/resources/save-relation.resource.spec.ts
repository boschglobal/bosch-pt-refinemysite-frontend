/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {ObjectIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../../shared/misc/enums/object-type.enum';
import {RelationTypeEnum} from '../../../enums/relation-type.enum';
import {SaveRelationResource} from './save-relation.resource';

describe('Save Relation Resource', () => {
    const taskId = 'foo';
    const milestoneId = 'bar';

    it('should generate a SaveRelationResource for a Milestone SubTask', () => {
        const expectedResult: SaveRelationResource = {
            type: RelationTypeEnum.PartOf,
            source: new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId),
            target: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId),
        };

        expect(SaveRelationResource.forMilestoneSubtask(milestoneId, taskId)).toEqual(expectedResult);
    });

    it('should generate a SaveRelationResource for a predecessor of a given originator', () => {
        const originator = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId);
        const predecessor = new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId);
        const expectedResult: SaveRelationResource = {
            type: RelationTypeEnum.FinishToStart,
            source: predecessor,
            target: originator,
        };

        expect(SaveRelationResource.forPredecessor(originator, predecessor)).toEqual(expectedResult);
    });

    it('should generate a SaveRelationResource for a successor of a given originator', () => {
        const originator = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId);
        const successor = new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId);
        const expectedResult: SaveRelationResource = {
            type: RelationTypeEnum.FinishToStart,
            source: originator,
            target: successor,
        };

        expect(SaveRelationResource.forSuccessor(originator, successor)).toEqual(expectedResult);
    });
});
