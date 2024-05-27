/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ActionReducer,
    combineReducers
} from '@ngrx/store';

import {CRAFT_REDUCER} from './crafts/craft.reducer';
import {MasterDataModuleSlice} from './master-data-module.slice';

const MASTER_DATA_MODULE_REDUCERS = {
    craftSlice: CRAFT_REDUCER,
};

export const MASTER_DATA_MODULE_REDUCER: ActionReducer<MasterDataModuleSlice> = combineReducers(MASTER_DATA_MODULE_REDUCERS);
