/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {TopicSlice} from './topic.slice';

export const TOPIC_SLICE_INITIAL_STATE: TopicSlice = {
    currentItem: {
      id: null,
      requestStatus: RequestStatusEnum.empty
    },
    items: [],
    list: {
        ids: [],
        requestStatus: RequestStatusEnum.empty
    }
};
