/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ObjectIdentifierPair} from './object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../enums/object-type.enum';

export class ObjectIdentifierPairWithVersion extends ObjectIdentifierPair {
    constructor(public type: ObjectTypeEnum,
                public id: string,
                public version: number) {
        super(type, id);
    }

    public stringify(): string {
        return `${super.stringify()}.v${this.version}`;
    }

    public isSame(context: ObjectIdentifierPairWithVersion): boolean {
        return super.isSame(context) && this.hasSameVersion(context);
    }

    public hasSameVersion(context: ObjectIdentifierPairWithVersion): boolean {
        return this.version === context.version;
    }
}
