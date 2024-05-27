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
import {SaveRelationFilters} from './save-relation-filters';

describe('Save Relation Filters', () => {
    const milestoneId = 'foo';
    const taskId = 'bar';

    it('should generate a SaveRelationFilters for PART_OF by sources and targets', () => {
        const sources: ObjectIdentifierPair[] = [new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId)];
        const targets: ObjectIdentifierPair[] = [new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId)];
        const expectedResult: SaveRelationFilters = {
            sources,
            targets,
            types: [RelationTypeEnum.PartOf],
        };

        expect(SaveRelationFilters.forPartOfRelationsBySourcesAndTargets(sources, targets)).toEqual(expectedResult);
    });

    it('should generate a SaveRelationFilters for PART_OF relation by target id and type', () => {
        const expectedResult: SaveRelationFilters = {
            types: [RelationTypeEnum.PartOf],
            targets: [new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId)],
            sources: [],
        };

        expect(SaveRelationFilters.forPartOftRelationsByTargetIdAndType(milestoneId, ObjectTypeEnum.Milestone)).toEqual(expectedResult);
    });

    it('should generate a SaveRelationFilters for PART_OF relation by source id and type', () => {
        const expectedResult: SaveRelationFilters = {
            types: [RelationTypeEnum.PartOf],
            sources: [new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId)],
            targets: [],
        };

        expect(SaveRelationFilters.forPartOfRelationsBySourceIdAndType(taskId, ObjectTypeEnum.Task)).toEqual(expectedResult);
    });

    it('should generate a SaveRelationFilters for Milestone subtasks by Milestone id', () => {
        const expectedResult: SaveRelationFilters = {
            types: [RelationTypeEnum.PartOf],
            targets: [new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId)],
            sources: [],
        };

        expect(SaveRelationFilters.forMilestoneSubtasksByMilestoneId(milestoneId)).toEqual(expectedResult);
    });

    it('should generate a SaveRelationFilters for Task Milestones by Task id', () => {
        const expectedResult: SaveRelationFilters = {
            types: [RelationTypeEnum.PartOf],
            sources: [new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId)],
            targets: [],
        };

        expect(SaveRelationFilters.forTaskMilestonesByTaskId(taskId)).toEqual(expectedResult);
    });

    it('should generate a SaveRelationFilters for FINISH_TO_START relations by sources and targets', () => {
        const sources: ObjectIdentifierPair[] = [new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId)];
        const targets: ObjectIdentifierPair[] = [new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId)];
        const expectedResult: SaveRelationFilters = {
            sources,
            targets,
            types: [RelationTypeEnum.FinishToStart],
        };

        expect(SaveRelationFilters.forFinishToStartRelationsBySourcesAndTargets(sources, targets)).toEqual(expectedResult);
    });

    it('should generate a SaveRelationFilters or finish to start dependencies by an Object Identifier Pair', () => {
        const objectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId);
        const expectedResult: SaveRelationFilters = {
            types: [RelationTypeEnum.FinishToStart],
            sources: [objectIdentifierPair],
            targets: [objectIdentifierPair],
        };

        expect(SaveRelationFilters.forFinishToStartDependenciesByObjectIdentifierPair(objectIdentifierPair)).toEqual(expectedResult);
    });
});
