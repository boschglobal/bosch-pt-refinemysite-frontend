/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {ResourceLink} from '../../../../../shared/misc/api/datatypes/resource-link.datatype';

export class ConstraintResource {
    key: ConstraintKey;
    name: string;
    active: boolean;
    _links: ConstraintLinks;
}

export class ConstraintLinks {
    activate?: ResourceLink;
    deactivate?: ResourceLink;
    update?: ResourceLink;
}

export type ConstraintKey = 'RESOURCES'
    | 'INFORMATION'
    | 'EQUIPMENT'
    | 'MATERIAL'
    | 'PRELIMINARY_WORK'
    | 'SAFE_WORKING_ENVIRONMENT'
    | 'EXTERNAL_FACTORS'
    | 'COMMON_UNDERSTANDING'
    | 'CUSTOM1'
    | 'CUSTOM2'
    | 'CUSTOM3'
    | 'CUSTOM4';
