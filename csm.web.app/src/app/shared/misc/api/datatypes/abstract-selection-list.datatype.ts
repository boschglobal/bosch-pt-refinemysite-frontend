/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../enums/request-status.enum';

export class AbstractSelectionList {
    public ids: string[] = [];
    public isSelecting = false;
    public requestStatus: RequestStatusEnum = RequestStatusEnum.empty;
}
