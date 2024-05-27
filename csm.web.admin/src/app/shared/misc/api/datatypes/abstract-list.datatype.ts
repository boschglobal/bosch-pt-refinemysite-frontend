/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../enums/request-status.enum';

export class AbstractList<L> {
    public ids: string[] = [];
    public requestStatus: RequestStatusEnum = RequestStatusEnum.Empty;
    public version?: number;
    public _links?: L;
}
