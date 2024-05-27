/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Action,
    ActionReducer
} from '@ngrx/store';

import {PaginatorData} from '../../../app/shared/ui/paginator/paginator-data.datastructure';
import {
    INITIALIZE_MOCK_RESOURCE,
    SET_MOCK_RESOURCE_ITEMS,
    SET_MOCK_RESOURCE_PAGE,
    SET_MOCK_RESOURCE_SORT,
    SetMockResourceItemsAction,
    SetMockResourcePageAction,
    SetMockResourceSortAction
} from './mock-resource.actions';
import {MOCK_RESOURCE_SLICE_INITIAL_STATE} from './mock-resource.initial-state';
import {MockResourceSlice} from './mock-resource.slice';

export const MOCK_RESOURCE_REDUCER: ActionReducer<MockResourceSlice> = (state: MockResourceSlice = MOCK_RESOURCE_SLICE_INITIAL_STATE, action: Action) => {
    switch (action.type) {
        case INITIALIZE_MOCK_RESOURCE:
            return MOCK_RESOURCE_SLICE_INITIAL_STATE;

        case SET_MOCK_RESOURCE_PAGE:
            const setMockResourcePageAction = action as SetMockResourcePageAction;
            return Object.assign({}, state, {
                mockResourceListPaginator: Object.assign(
                    new PaginatorData(),
                    state.mockResourceListPaginator,
                    {page: setMockResourcePageAction.payload}
                )
            });

        case SET_MOCK_RESOURCE_ITEMS:
            const setMockResourceItemsAction = action as SetMockResourceItemsAction;
            return Object.assign({}, state, {
                mockResourceListPaginator: Object.assign(
                    new PaginatorData(),
                    state.mockResourceListPaginator,
                    {items: setMockResourceItemsAction.payload}
                )
            });

        case SET_MOCK_RESOURCE_SORT:
            const setMockResourceSortAction = action as SetMockResourceSortAction;
            return Object.assign({}, state, {
                mockResourceListSort: setMockResourceSortAction.payload
            });

        default:
            return state;
    }
};
