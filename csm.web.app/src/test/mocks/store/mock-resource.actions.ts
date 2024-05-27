/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {SorterData} from '../../../app/shared/ui/sorter/sorter-data.datastructure';

export const INITIALIZE_MOCK_RESOURCE = 'INITIALIZE_MOCK_RESOURCE';
export const SET_MOCK_RESOURCE_PAGE = 'SET_MOCK_RESOURCE_PAGE';
export const SET_MOCK_RESOURCE_ITEMS = 'SET_MOCK_RESOURCE_ITEMS';
export const SET_MOCK_RESOURCE_SORT = 'SET_MOCK_RESOURCE_SORT';

export class InitializeMockResourceAction implements Action {
    type = INITIALIZE_MOCK_RESOURCE;

    constructor() {
    }
}

export class SetMockResourcePageAction implements Action {
    type = SET_MOCK_RESOURCE_PAGE;

    constructor(public payload: number) {
    }
}

export class SetMockResourceItemsAction implements Action {
    type = SET_MOCK_RESOURCE_ITEMS;

    constructor(public payload: number) {
    }
}

export class SetMockResourceSortAction implements Action {
    type = SET_MOCK_RESOURCE_SORT;

    constructor(public payload: SorterData) {
    }
}
