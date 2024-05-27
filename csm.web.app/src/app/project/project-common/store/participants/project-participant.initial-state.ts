/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {SortDirectionEnum} from '../../../../shared/ui/sorter/sort-direction.enum';
import {ProjectParticipantSlice} from './project-participant.slice';
import {ProjectParticipantFilters} from './slice/project-participant-filters';

export const PROJECT_PARTICIPANT_SLICE_INITIAL_STATE: ProjectParticipantSlice = {
    items: [],
    currentItem: {
        id: null,
        requestStatus: RequestStatusEnum.empty,
    },
    list: {
        pages: [],
        pagination: {
            entries: 0,
            items: 100,
            page: 0,
        },
        sort: {
            field: 'user',
            direction: SortDirectionEnum.asc,
        },
        requestStatus: RequestStatusEnum.empty,
        filters: new ProjectParticipantFilters(),
    },
    fullList: {
        ids: [],
        requestStatus: RequestStatusEnum.empty,
    },
};
