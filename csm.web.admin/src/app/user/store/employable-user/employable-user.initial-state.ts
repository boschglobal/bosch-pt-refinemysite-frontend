/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {EmployableUserFilter} from '../../api/resources/employable-user-filter.resource';
import {EmployableUserSlice} from './employable-user.slice';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {SortDirectionEnum} from '../../../shared/ui/sorter/sort-direction.enum';

export const EMPLOYABLE_USER_SLICE_INITIAL_STATE: EmployableUserSlice = {
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
            field: 'company',
            direction: SortDirectionEnum.Asc
        },
        filter: new EmployableUserFilter(),
        requestStatus: RequestStatusEnum.Empty
    }
};
