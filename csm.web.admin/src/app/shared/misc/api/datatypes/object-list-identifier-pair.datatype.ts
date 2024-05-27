/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ObjectIdentifierPair} from './object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../enums/object-type.enum';

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
        return `${super.stringify()}${this._getIncludeChildrenIdentifier()}`;
    }

    public bothIncludeChildren(context: ObjectListIdentifierPair): boolean {
        return this.includeChildren === context.includeChildren;
    }

    public isSame(context: ObjectListIdentifierPair): boolean {
        return super.isSame(context) && this.bothIncludeChildren(context);
    }

    private _getIncludeChildrenIdentifier(): string {
        return this.includeChildren ? `.${this._includeChildrenIdentifier}` : '';
    }
}
