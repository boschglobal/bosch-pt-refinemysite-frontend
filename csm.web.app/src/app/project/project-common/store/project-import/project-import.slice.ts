/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ProjectImportAnalyzeResource} from '../../api/project-import/resources/project-import-analyze.resource';
import {ProjectImportUploadResource} from '../../api/project-import/resources/project-import-upload.resource';

export type ProjectImportStep = 'upload' | 'analyze' | 'import';

export interface ProjectImportSlice {
    requestStatus: { [key in ProjectImportStep]: RequestStatusEnum };
    uploadResponse: ProjectImportUploadResource;
    analyzeResponse: ProjectImportAnalyzeResource;
}
