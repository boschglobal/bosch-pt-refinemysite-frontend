/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {AbstractResource} from '../../../../../shared/misc/api/resources/abstract.resource';
import {ProjectImportColumnResource} from './project-import-column.resource';

export class ProjectImportUploadResource extends AbstractResource {
    public columns: ProjectImportColumnResource[];
}
