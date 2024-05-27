/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {ConstraintKey} from './constraint.resource';

export class SaveConstraintResource {
    key: ConstraintKey;
    active: boolean;
    name: string;
}
