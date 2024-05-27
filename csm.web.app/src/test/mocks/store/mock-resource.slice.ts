/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {PaginatorData} from '../../../app/shared/ui/paginator/paginator-data.datastructure';
import {SorterData} from '../../../app/shared/ui/sorter/sorter-data.datastructure';

export interface MockResourceSlice {
    mockResourceListPaginator: PaginatorData;
    mockResourceListSort: SorterData;
}
