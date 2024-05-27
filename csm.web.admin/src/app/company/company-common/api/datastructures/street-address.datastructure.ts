/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractAddress} from './abstract-address.datastructure';

export class StreetAddress extends AbstractAddress {
    street: string;
    houseNumber: string;
}
