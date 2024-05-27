/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {MilestoneResource} from '../../api/milestones/resources/milestone.resource';
import {MilestoneListLinks} from '../../api/milestones/resources/milestone-list.resource';
import {MilestoneFilters} from './slice/milestone-filters';

export interface MilestoneSlice {
    currentItem: AbstractItem;
    filters: MilestoneFilters;
    items: MilestoneResource[];
    list: AbstractList<MilestoneListLinks>;
}
