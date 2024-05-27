/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../enums/request-status.enum';

/**
 * P Abstract Item Permission (the permissions for a single resource)
 */
export class AbstractItem {
    public id: string = null;
    public requestStatus: RequestStatusEnum = RequestStatusEnum.empty;
}
