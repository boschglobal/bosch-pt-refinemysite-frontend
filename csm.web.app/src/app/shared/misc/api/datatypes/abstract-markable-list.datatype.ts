/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractList} from './abstract-list.datatype';

export class AbstractMarkableList<L> extends AbstractList<L> {
    lastSeen: string;
    lastAdded: string;
}
