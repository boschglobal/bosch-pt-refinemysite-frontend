/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {WorkareaResource} from '../../api/workareas/resources/workarea.resource';
import {WorkareaListLinks} from '../../api/workareas/resources/workarea-list.resource';

export interface WorkareaSlice {
    items: WorkareaResource[];
    currentItem: AbstractItem;
    list: AbstractList<WorkareaListLinks>;
}
