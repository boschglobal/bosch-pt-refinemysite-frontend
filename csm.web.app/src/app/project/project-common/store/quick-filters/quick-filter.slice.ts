/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {QuickFilterResource} from '../../api/quick-filters/resources/quick-filter.resource';
import {QuickFilterListLinks} from '../../api/quick-filters/resources/quick-filter-list.resource';
import {QuickFilterId} from '../../models/quick-filters/quick-filter';

export interface QuickFilterSlice {
    currentItem: AbstractItem;
    appliedFilterId: QuickFilterAppliedFilters;
    items: QuickFilterResource[];
    list: AbstractList<QuickFilterListLinks>;
}

export type QuickFilterAppliedFilters = { [key in QuickFilterContext]: QuickFilterId };

export type QuickFilterContext = 'list' | 'calendar';
