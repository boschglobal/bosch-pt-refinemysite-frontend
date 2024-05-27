/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {CRAFT_SLICE_INITIAL_STATE} from './crafts/craft.initial-state';
import {MasterDataModuleSlice} from './master-data-module.slice';

export const MASTER_DATA_MODULE_INITIAL_STATE: MasterDataModuleSlice = {
    craftSlice: CRAFT_SLICE_INITIAL_STATE
};
