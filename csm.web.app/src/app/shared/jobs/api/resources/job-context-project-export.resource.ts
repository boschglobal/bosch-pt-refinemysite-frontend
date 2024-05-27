/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {ResourceReference} from '../../../misc/api/datatypes/resource-reference.datatype';

export class JobContextProjectExport {
    public project: ResourceReference;
    public fileName: string;
}
