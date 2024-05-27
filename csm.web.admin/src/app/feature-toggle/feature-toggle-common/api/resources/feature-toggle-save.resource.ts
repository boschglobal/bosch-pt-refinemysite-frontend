/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';

export class FeatureToggleSaveResource {
    public type: ObjectTypeEnum;

    constructor(type: ObjectTypeEnum) {
        this.type = type;
    }
}
