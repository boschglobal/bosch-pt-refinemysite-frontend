/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {DayCardSlice} from './day-card.slice';

export const DAY_CARD_SLICE_INITIAL_STATE: DayCardSlice = {
    currentItem: {
        id: null,
        requestStatus: RequestStatusEnum.empty,
    },
    items: [],
};
