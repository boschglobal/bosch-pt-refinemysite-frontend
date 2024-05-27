/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {MetricsSlice} from './metrics.slice';

export const METRICS_SLICE_INITIAL_STATE: MetricsSlice = {
    fulfilledDayCardsAll: {
        items: [],
        requestStatus: RequestStatusEnum.empty
    },
    fulfilledDayCardsGrouped: {
        items: [],
        requestStatus: RequestStatusEnum.empty
    },
    reasonsForVarianceAll: {
        items: [],
        requestStatus: RequestStatusEnum.empty,
    },
    timeFilters: {
        startDate: null,
        duration: null
    }
};
