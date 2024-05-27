/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {EnvironmentConfig} from './interfaces/environment-config.interface';

export const configuration: EnvironmentConfig = {
    prodMode: true,
    projectImportMaxFileSize: 200,
    imageUploadMaxFileSize: 20,
    api: null,
    apiAuth: null,
    features: [],
    projectExportExcelTemplateUrl: 'https://developer.bosch-refinemysite.com/assets/excel/RefinemySiteExcelTemplate.zip',
};
