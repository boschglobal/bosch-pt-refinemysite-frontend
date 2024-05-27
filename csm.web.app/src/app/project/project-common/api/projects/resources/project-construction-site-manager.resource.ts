/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {PhoneNumber} from '../../../../../shared/misc/api/datatypes/phone-number.datatype';

export class ProjectConstructionSiteManagerResource {
    public displayName: string;
    public phoneNumbers: PhoneNumber[];
    public position: string;
}
