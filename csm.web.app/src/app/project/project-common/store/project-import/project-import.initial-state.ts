/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ProjectImportSlice} from './project-import.slice';

export const PROJECT_IMPORT_INITIAL_STATE: ProjectImportSlice = {
    requestStatus: {
        upload: RequestStatusEnum.empty,
        analyze: RequestStatusEnum.empty,
        import: RequestStatusEnum.empty,
    },
    uploadResponse: null,
    analyzeResponse: null,
};
