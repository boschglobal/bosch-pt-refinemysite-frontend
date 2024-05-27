/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../enums/request-status.enum';

export class AbstractItems<T> {
    public items: T[];
    public requestStatus: RequestStatusEnum = RequestStatusEnum.empty;
}
