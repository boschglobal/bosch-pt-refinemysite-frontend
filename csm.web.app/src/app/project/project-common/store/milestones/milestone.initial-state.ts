/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {MilestoneSlice} from './milestone.slice';
import {MilestoneFilters} from './slice/milestone-filters';

export const MILESTONE_SLICE_INITIAL_STATE: MilestoneSlice = {
    currentItem: {
        id: null,
        requestStatus: RequestStatusEnum.empty,
    },
    filters: new MilestoneFilters(),
    items: [],
    list: {
        ids: [],
        requestStatus: RequestStatusEnum.empty,
    },
};
