/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {PATResource} from '../../../project/project-common/api/pats/resources/pat.resource';
import {PATListLinks} from '../../../project/project-common/api/pats/resources/pat-list.resource';
import {AbstractList} from '../../../shared/misc/api/datatypes/abstract-list.datatype';
import {AbstractItem} from '../../../shared/misc/store/datatypes/abstract-item.datatype';

export interface PATSlice {
    currentItem: AbstractItem;
    items: PATResource[];
    list: AbstractList<PATListLinks>;
}
