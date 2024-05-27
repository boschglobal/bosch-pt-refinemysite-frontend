/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {PostBoxAddress} from '../datastructures/post-box-address.datastructure';
import {StreetAddress} from '../datastructures/street-address.datastructure';

export class CompanySaveResource {
    public name: string;
    public postBoxAddress?: PostBoxAddress;
    public streetAddress?: StreetAddress;

    constructor(name: string, postBoxAddress: PostBoxAddress, streetBoxAddress: StreetAddress) {
        this.name = name;
        this.postBoxAddress = postBoxAddress;
        this.streetAddress = streetBoxAddress;
    }
}
