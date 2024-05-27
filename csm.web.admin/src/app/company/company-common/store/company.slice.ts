/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceReference} from '../../../shared/misc/api/datatypes/resource-reference.datatype';
import {AbstractItem} from '../../../shared/misc/store/datatypes/abstract-item.datatype';
import {AbstractPageableList} from '../../../shared/misc/api/datatypes/abstract-pageable-list.datatype';
import {CompanyFilterData} from '../api/resources/company-filter.resource';
import {CompanyListResourceLinks} from '../api/resources/company-list.resource';
import {CompanyResource} from '../api/resources/company.resource';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {SortDirectionEnum} from '../../../shared/ui/sorter/sort-direction.enum';

export interface CompanySlice {
    items: CompanyResource[];
    currentItem: AbstractItem;
    list: CompanyList;
    suggestions: ResourceReference[];
}

export const COMPANY_SLICE_INITIAL_STATE: CompanySlice = {
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
        filter: new CompanyFilterData(),
        requestStatus: RequestStatusEnum.Empty
    },
    suggestions: []
};

export class CompanyList extends AbstractPageableList<CompanyListResourceLinks> {
    filter: CompanyFilterData;
}
