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

export class SaveRelationFilters {
    public types?: RelationTypeEnum[];
    public sources?: ObjectIdentifierPair[];
    public targets?: ObjectIdentifierPair[];

    public static forFinishToStartRelationsBySourcesAndTargets(sources: ObjectIdentifierPair[],
                                                               targets: ObjectIdentifierPair[]): SaveRelationFilters {
        return {
            sources,
            targets,
            types: [RelationTypeEnum.FinishToStart],
        };
    }

    public static forPartOfRelationsBySourcesAndTargets(sources: ObjectIdentifierPair[] = [],
                                                        targets: ObjectIdentifierPair[] = []): SaveRelationFilters {
        return {
            sources,
            targets,
            types: [RelationTypeEnum.PartOf],
        };
    }

    public static forPartOftRelationsByTargetIdAndType(id: string, type: ObjectTypeEnum): SaveRelationFilters {
        const targets = [new ObjectIdentifierPair(type, id)];

        return this.forPartOfRelationsBySourcesAndTargets(undefined, targets);
    }

    public static forPartOfRelationsBySourceIdAndType(id: string, type: ObjectTypeEnum): SaveRelationFilters {
        const sources = [new ObjectIdentifierPair(type, id)];

        return this.forPartOfRelationsBySourcesAndTargets(sources);
    }

    public static forFinishToStartDependenciesByObjectIdentifierPair(objectIdentifierPair: ObjectIdentifierPair): SaveRelationFilters {
        return this.forFinishToStartRelationsBySourcesAndTargets([objectIdentifierPair], [objectIdentifierPair]);
    }

    public static forMilestoneSubtasksByMilestoneId(milestoneId: string): SaveRelationFilters {
        return this.forPartOftRelationsByTargetIdAndType(milestoneId, ObjectTypeEnum.Milestone);
    }

    public static forTaskMilestonesByTaskId(taskId: string): SaveRelationFilters {
        return this.forPartOfRelationsBySourceIdAndType(taskId, ObjectTypeEnum.Task);
    }
}
