/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {ResourceReference} from '../../../misc/api/datatypes/resource-reference.datatype';

export class JobContextProjectImport {
    public project: ResourceReference;
    public fileName: string;
}
