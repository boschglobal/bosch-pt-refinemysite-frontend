/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ObjectIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';

export class NewsResource {
    public context: ObjectIdentifierPair;
    public parent: ObjectIdentifierPair;
    public root: ObjectIdentifierPair;
    public createdDate: Date;
    public lastModifiedDate: Date;

    constructor(context: ObjectIdentifierPair, parent: ObjectIdentifierPair, root: ObjectIdentifierPair, createdDate: Date, lastModifiedDate: Date) {
        this.context = context;
        this.parent = parent;
        this.root = root;
        this.createdDate = createdDate;
        this.lastModifiedDate = lastModifiedDate;
    }
}
