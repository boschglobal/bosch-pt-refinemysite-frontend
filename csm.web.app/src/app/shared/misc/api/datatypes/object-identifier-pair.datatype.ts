/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ObjectTypeEnum} from '../../enums/object-type.enum';

export class ObjectIdentifierPair {
    /**
     * @deprecated identifier property is deprecated and will be dropped when the backend adapts all Microservices. Prefer id property.
     */
    public identifier?: string;

    constructor(public type: ObjectTypeEnum,
                public id: string) {
        this.identifier = id;
    }

    public isSameType(context: ObjectIdentifierPair): boolean {
        return this.type === context.type;
    }

    public isSameId(context: ObjectIdentifierPair): boolean {
        return this.id === context.id;
    }

    public isSame(context: ObjectIdentifierPair): boolean {
        return this.isSameType(context) && this.isSameId(context);
    }

    public stringify(): string {
        return `${this.type}.${this.id}`;
    }
}
