/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {ObjectTypeEnum} from '../../enums/object-type.enum';

export class ResourceWithType<T> {
    public type: ObjectTypeEnum;
    public resource: T;
}
