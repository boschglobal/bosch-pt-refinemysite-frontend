/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {PaginatorData} from '../../../app/shared/ui/paginator/paginator-data.datastructure';
import {SorterData} from '../../../app/shared/ui/sorter/sorter-data.datastructure';
import {MockResourceSlice} from './mock-resource.slice';

export const MOCK_RESOURCE_SLICE_INITIAL_STATE: MockResourceSlice = {
    mockResourceListPaginator: new PaginatorData(),
    mockResourceListSort: new SorterData('foo'),
};
