/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {RelationListLinks} from '../../api/relations/resources/relation-list.resource';
import {RelationTypeEnum} from '../../enums/relation-type.enum';
import {RelationSlice} from './relation.slice';

export const RELATION_INITIAL_STATE: RelationSlice = {
    currentItem: {
        id: null,
        requestStatus: RequestStatusEnum.empty,
    },
    lists: new Map<RelationTypeEnum, AbstractList<RelationListLinks>>(),
    items: [],
};
