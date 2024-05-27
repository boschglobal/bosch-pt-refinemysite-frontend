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

export class SaveRelationResource {
    public type: RelationTypeEnum;
    public source: ObjectIdentifierPair;
    public target: ObjectIdentifierPair;

    /**
     * Factory function to create a SaveRelationResource that represents a Task part of a Milestone
     *
     * @param milestoneId
     * @param taskId
     */
    public static forMilestoneSubtask(milestoneId: string, taskId: string): SaveRelationResource {
        return {
            type: RelationTypeEnum.PartOf,
            source: new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId),
            target: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId),
        };
    }

    /**
     * Factory function to create a SaveRelationResource that represents a predecessor of a given originator
     *
     * @param originator
     * @param predecessor
     */
    public static forPredecessor(originator: ObjectIdentifierPair, predecessor: ObjectIdentifierPair): SaveRelationResource {
        return {
            type: RelationTypeEnum.FinishToStart,
            source: predecessor,
            target: originator,
        };
    }

    /**
     * Factory function to create a SaveRelationResource that represents a successor of a given originator
     *
     * @param originator
     * @param successor
     */
    public static forSuccessor(originator: ObjectIdentifierPair, successor: ObjectIdentifierPair): SaveRelationResource {
        return {
            type: RelationTypeEnum.FinishToStart,
            source: originator,
            target: successor,
        };
    }
}
