/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../enums/request-status.enum';

export class AbstractEntity {
    public id: string = null;
    public requestStatus: RequestStatusEnum = RequestStatusEnum.empty;
}
