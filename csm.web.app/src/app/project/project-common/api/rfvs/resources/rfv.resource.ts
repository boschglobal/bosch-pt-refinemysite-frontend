/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';

export class RfvResource {
    key: RfvKey;
    name: string;
    active: boolean;
    _links: RfvLinks;
}

export class RfvLinks {
    activate?: ResourceLink;
    deactivate?: ResourceLink;
    update?: ResourceLink;
}

export type RfvKey = 'OPEN'
    | 'DELAYED_MATERIAL'
    | 'NO_CONCESSION'
    | 'CONCESSION_NOT_RECOGNIZED'
    | 'CHANGED_PRIORITY'
    | 'MANPOWER_SHORTAGE'
    | 'OVERESTIMATION'
    | 'TOUCHUP'
    | 'MISSING_INFOS'
    | 'MISSING_TOOLS'
    | 'BAD_WEATHER'
    | 'CUSTOM1'
    | 'CUSTOM2'
    | 'CUSTOM3'
    | 'CUSTOM4';
