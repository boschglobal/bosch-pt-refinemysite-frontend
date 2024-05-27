/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {QuickFilterSlice} from './quick-filter.slice';

export const QUICK_FILTER_SLICE_INITIAL_STATE: QuickFilterSlice = {
    currentItem: {
        id: null,
        requestStatus: RequestStatusEnum.empty,
    },
    appliedFilterId: {
        list: 'all',
        calendar: 'all',
    },
    items: [],
    list: {
        ids: [],
        requestStatus: RequestStatusEnum.empty,
    },
};
