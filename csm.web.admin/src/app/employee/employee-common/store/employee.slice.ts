/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractItem} from '../../../shared/misc/store/datatypes/abstract-item.datatype';
import {AbstractPageableList} from '../../../shared/misc/api/datatypes/abstract-pageable-list.datatype';
import {EmployeeListResourceLinks} from '../api/resources/employee-list.resource';
import {EmployeeResource} from '../api/resources/employee.resource';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {SortDirectionEnum} from '../../../shared/ui/sorter/sort-direction.enum';

export interface EmployeeSlice {
    currentItem: AbstractItem;
    list: AbstractPageableList<EmployeeListResourceLinks>;
    items: EmployeeResource[];
}

export const EMPLOYEE_SLICE_INITIAL_STATE: EmployeeSlice = {
    items: [],
    currentItem: {
        id: null,
        requestStatus: RequestStatusEnum.Empty
    },
    list: {
        pages: [],
        pagination: {
            totalElements: 0,
            pageSize: 25,
            pageNumber: 0,
            totalPages: 0
        },
        sort: {
            field: 'name',
            direction: SortDirectionEnum.Asc
        },
        requestStatus: RequestStatusEnum.Empty
    }
};
