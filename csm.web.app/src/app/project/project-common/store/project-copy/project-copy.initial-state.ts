/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ProjectCopySlice} from './project-copy.slice';

export const PROJECT_COPY_SLICE_INITIAL_STATE: ProjectCopySlice = {
    currentItem: {
        id: null,
        requestStatus: RequestStatusEnum.empty,
    },
};
