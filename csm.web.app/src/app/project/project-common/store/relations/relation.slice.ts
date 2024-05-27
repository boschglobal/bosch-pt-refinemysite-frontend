/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {RelationResource} from '../../api/relations/resources/relation.resource';
import {RelationListLinks} from '../../api/relations/resources/relation-list.resource';
import {RelationTypeEnum} from '../../enums/relation-type.enum';

export class RelationSlice {
    currentItem: AbstractItem;
    lists: Map<RelationTypeEnum, AbstractList<RelationListLinks>>;
    items: RelationResource[];
}
