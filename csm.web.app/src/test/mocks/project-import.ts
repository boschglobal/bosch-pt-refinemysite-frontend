/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {ProjectImportAnalyzeResource} from '../../app/project/project-common/api/project-import/resources/project-import-analyze.resource';
import {ProjectImportUploadResource} from '../../app/project/project-common/api/project-import/resources/project-import-upload.resource';
import {SaveProjectImportAnalyzeResource} from '../../app/project/project-common/api/project-import/resources/save-project-import-analyze.resource';

export const PROJECT_IMPORT_UPLOAD_RESOURCE_1: ProjectImportUploadResource = {
    id: '228b6a6e-6379-446b-b817-84e8616e3156',
    columns: [{
        name: 'Resource Names',
        columnType: 'Project',
        fieldType: 'RESOURCE_NAMES',
    }],
};

export const PROJECT_IMPORT_ANALYZE_RESOURCE_1: ProjectImportAnalyzeResource = {
    id: '17a536b3-5e88-423c-bf48-8f0763668ac4',
    version: 1,
    validationResults: [],
    statistics: {
        workAreas: 0,
        crafts: 2,
        tasks: 1,
        milestones: 0,
        relations: 0,
    },
};

export const PROJECT_IMPORT_ANALYZE_RESOURCE_2: ProjectImportAnalyzeResource = {
    id: '17a536b3-5e88-423c-bf48-8f0763668ac4',
    version: 1,
    validationResults: [],
    statistics: {
        workAreas: 0,
        crafts: 2,
        tasks: 1,
        milestones: 0,
        relations: 0,
    },
    _links: {
        import: {
            href: 'import',
        },
    },
};

export const SAVE_PROJECT_IMPORT_ANALYZE_RESOURCE_1: SaveProjectImportAnalyzeResource = {
    readWorkAreasHierarchically: false,
    craftColumn: {
        columnType: 'Project',
        fieldType: 'NAME',
    },
};
