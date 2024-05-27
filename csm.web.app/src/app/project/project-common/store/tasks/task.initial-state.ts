/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {SortDirectionEnum} from '../../../../shared/ui/sorter/sort-direction.enum';
import {ProjectTaskFilters} from './slice/project-task-filters';
import {ProjectTaskSlice} from './task.slice';

export const PROJECT_TASK_SLICE_INITIAL_STATE: ProjectTaskSlice = {
    currentItem: {
        id: null,
        requestStatus: RequestStatusEnum.empty,
    },
    list: {
        filters: new ProjectTaskFilters(),
        isFilterPanelOpen: null,
        pages: [],
        pagination: {
            entries: 0,
            items: 100,
            page: 0,
        },
        sort: {
            field: 'name',
            direction: SortDirectionEnum.asc,
        },
        requestStatus: RequestStatusEnum.empty,
    },
    calendar: {
        filters: new ProjectTaskFilters(),
        isFilterPanelOpen: null,
        pages: [],
        pagination: {
            entries: 0,
            items: 500,
            page: 0,
        },
        sort: {
            field: 'calendarDefault',
            direction: SortDirectionEnum.asc,
        },
        requestStatus: RequestStatusEnum.empty,
    },
    assignList: {
        ids: [],
        isSelecting: false,
        requestStatus: RequestStatusEnum.empty,
    },
    sendList: {
        ids: [],
        isSelecting: false,
        requestStatus: RequestStatusEnum.empty,
    },
    items: [],
};
