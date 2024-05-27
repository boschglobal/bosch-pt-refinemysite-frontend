/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {ObjectIdentifierPair} from './object-identifier-pair.datatype';

export class AbstractSelection<T, I = ObjectIdentifierPair> {
    public items: I[] = [];
    public mode: T;
}
