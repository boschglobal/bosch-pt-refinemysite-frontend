/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {PaginatorData} from '../../../ui/paginator/paginator-data.datastructure';
import {RequestStatusEnum} from '../../enums/request-status.enum';
import {SorterData} from '../../../ui/sorter/sorter-data.datastructure';

export class AbstractPageableList<L> {
    public pages: string[][] = [];
    public pagination: PaginatorData = new PaginatorData();
    public sort: SorterData;
    public requestStatus: RequestStatusEnum = RequestStatusEnum.Empty;
    public _links?: L;

    constructor(sort: SorterData = new SorterData()) {
        this.sort = sort;
    }
}

