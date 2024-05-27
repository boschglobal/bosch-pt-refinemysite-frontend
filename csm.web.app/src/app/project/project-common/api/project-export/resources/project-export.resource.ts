/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {ProjectExportFormatEnum} from '../../../enums/project-export-format.enum';
import {ProjectExportSchedulingTypeEnum} from '../../../enums/project-export-scheduling-type.enum';

export class ProjectExportResource {
    constructor(public format: ProjectExportFormatEnum,
                public includeComments?: boolean,
                public taskExportSchedulingType?: ProjectExportSchedulingTypeEnum,
                public milestoneExportSchedulingType?: ProjectExportSchedulingTypeEnum,
    ) {
    }
}
