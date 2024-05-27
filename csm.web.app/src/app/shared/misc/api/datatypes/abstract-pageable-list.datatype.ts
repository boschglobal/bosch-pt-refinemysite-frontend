/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {PaginatorData} from '../../../ui/paginator/paginator-data.datastructure';
import {SorterData} from '../../../ui/sorter/sorter-data.datastructure';
import {RequestStatusEnum} from '../../enums/request-status.enum';

export class AbstractPageableList<L, F extends string = string> {
    public pages: string[][] = [];
    public pagination: PaginatorData = new PaginatorData();
    public sort: SorterData<F>;
    public requestStatus: RequestStatusEnum = RequestStatusEnum.empty;
    public _links?: L;
}
