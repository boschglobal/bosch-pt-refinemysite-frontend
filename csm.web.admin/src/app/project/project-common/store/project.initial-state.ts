/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {SortDirectionEnum} from '../../../shared/ui/sorter/sort-direction.enum';
import {SorterData} from '../../../shared/ui/sorter/sorter-data.datastructure';
import {ProjectFiltersResource} from '../api/resources/project-filters.resource';
import {ProjectSlice} from './project.slice';

export const PROJECT_SLICE_INITIAL_STATE: ProjectSlice = {
    userActivated: false,
    currentItem: {
        id: null,
        requestStatus: RequestStatusEnum.Empty
    },
    list: {
        pages: [],
        pagination: {
            pageNumber: 0,
            pageSize: 25,
            totalElements: 0,
            totalPages: 0,
        },
        sort: new SorterData('title', SortDirectionEnum.Asc),
        filters: new ProjectFiltersResource(),
        requestStatus: RequestStatusEnum.Empty
    },
    items: [],
};
