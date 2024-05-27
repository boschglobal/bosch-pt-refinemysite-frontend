/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractItem} from '../../../shared/misc/store/datatypes/abstract-item.datatype';
import {AbstractPageableList} from '../../../shared/misc/api/datatypes/abstract-pageable-list.datatype';
import {EmployableUserFilter} from '../../api/resources/employable-user-filter.resource';
import {EmployableUserResource} from '../../api/resources/employable-user.resource';
import {EmployableUserResourceListLinks} from '../../api/resources/employable-user-list.resource';

export class EmployableUserSlice {
    currentItem: AbstractItem;
    list: EmployableUserList;
    items: EmployableUserResource[];
}

export class EmployableUserList extends AbstractPageableList<EmployableUserResourceListLinks> {
    filter: EmployableUserFilter;
}
