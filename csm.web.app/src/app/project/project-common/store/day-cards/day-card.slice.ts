/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {DayCardResource} from '../../api/day-cards/resources/day-card.resource';

export interface DayCardSlice {
    currentItem: AbstractItem;
    items: DayCardResource[];
}
