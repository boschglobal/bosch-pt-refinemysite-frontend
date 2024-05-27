/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {PATScope} from './pat.resource';

export class SavePATResource {
    public description?: string;
    public scopes: PATScope[];
    public validForMinutes: number;
}
