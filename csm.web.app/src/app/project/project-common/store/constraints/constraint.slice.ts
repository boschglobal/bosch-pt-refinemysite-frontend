/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {AbstractItemsResourceLinks} from '../../../../shared/misc/api/resources/abstract-items.resource';
import {ConstraintEntity} from '../../entities/constraints/constraint';

export class ConstraintSlice {
    items: ConstraintEntity[];
    list: AbstractList<AbstractItemsResourceLinks>;
}
