/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ObjectTypeEnum} from '../../enums/object-type.enum';
import {ObjectIdentifierPair} from './object-identifier-pair.datatype';

export class ObjectListIdentifierPair extends ObjectIdentifierPair {
    public includeChildren: boolean;
    private readonly _includeChildrenIdentifier = 'INCLUDE_CHILDREN';

    constructor(type: ObjectTypeEnum,
                id: string,
                includeChildren = false) {
        super(type, id);
        this.includeChildren = includeChildren;
    }

    public stringify(): string {
        return `${super.stringify()}${this.getIncludeChildrenIdentifier()}`;
    }

    public bothIncludeChildren(context: ObjectListIdentifierPair): boolean {
        return this.includeChildren === context.includeChildren;
    }

    public isSame(context: ObjectListIdentifierPair): boolean {
        return super.isSame(context) && this.bothIncludeChildren(context);
    }

    private getIncludeChildrenIdentifier(): string {
        return this.includeChildren ? `.${this._includeChildrenIdentifier}` : '';
    }
}
