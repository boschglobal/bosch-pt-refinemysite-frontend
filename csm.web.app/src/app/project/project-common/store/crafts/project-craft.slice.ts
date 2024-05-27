/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {ProjectCraftResource} from '../../api/crafts/resources/project-craft.resource';
import {ProjectCraftListLinks} from '../../api/crafts/resources/project-craft-list.resource';

export interface ProjectCraftSlice {
    items: ProjectCraftResource[];
    currentItem: AbstractItem;
    list: AbstractList<ProjectCraftListLinks>;
}
