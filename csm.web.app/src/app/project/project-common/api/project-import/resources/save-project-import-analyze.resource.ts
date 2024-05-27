/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {ProjectImportColumnResource} from './project-import-column.resource';

export class SaveProjectImportAnalyzeResource {
    public readWorkAreasHierarchically?: boolean;
    public craftColumn?: ProjectImportColumnResource;
    public workAreaColumn?: ProjectImportColumnResource;
}
