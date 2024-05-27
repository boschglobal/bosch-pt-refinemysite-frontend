/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ProjectCraftSlice} from './project-craft.slice';

export const PROJECT_CRAFT_SLICE_INITIAL_STATE: ProjectCraftSlice = {
    currentItem: {
        id: null,
        requestStatus: RequestStatusEnum.empty,
    },
    list: {
        ids: [],
        requestStatus: RequestStatusEnum.empty,
    },
    items: [],
};
