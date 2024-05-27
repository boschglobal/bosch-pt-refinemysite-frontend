/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../enums/request-status.enum';
import {AbstractItem} from './abstract-item.datatype';

export class AbstractItemWithPicture extends AbstractItem {
    public dataRequestStatus: RequestStatusEnum = RequestStatusEnum.empty;
    public pictureRequestStatus: RequestStatusEnum = RequestStatusEnum.empty;
}
