/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ConstraintSlice} from './constraint.slice';

export const CONSTRAINT_INITIAL_STATE: ConstraintSlice = {
    items: [],
    list: {
        ids: [],
        requestStatus: RequestStatusEnum.empty,
    },
};
