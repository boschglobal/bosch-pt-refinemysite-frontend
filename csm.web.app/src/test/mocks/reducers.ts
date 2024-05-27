/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {MOCK_RESOURCE_SLICE_INITIAL_STATE} from './store/mock-resource.initial-state';
import {MOCK_RESOURCE_REDUCER} from './store/mock-resource.reducer';
import {MockResourceSlice} from './store/mock-resource.slice';

export interface MockState {
    mockResourceSlice: MockResourceSlice;
}

export const MOCK_INITIAL_STATE = {
    mockResourceSlice: MOCK_RESOURCE_SLICE_INITIAL_STATE,
};

export const MOCK_REDUCER = {
    mockResourceSlice: MOCK_RESOURCE_REDUCER,
};
