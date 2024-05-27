/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {RfvKey} from './rfv.resource';

export class SaveRfvResource {
    key: RfvKey;
    active: boolean;
    name: string;
}
