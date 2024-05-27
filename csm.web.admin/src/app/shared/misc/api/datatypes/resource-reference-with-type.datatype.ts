/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ObjectTypeEnum} from '../../enums/object-type.enum';

export class ResourceReferenceWithType {
    public type: ObjectTypeEnum;
    public id: string;
    public text: string;

    constructor(id: string, text: string, type: ObjectTypeEnum) {
        this.id = id;
        this.text = text;
        this.type = type;
    }
}
