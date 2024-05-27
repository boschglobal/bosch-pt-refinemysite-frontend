/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {EnvironmentConfig} from './interfaces/environment-config.interface';

export const configuration: EnvironmentConfig = {
    prodMode: false,
    projectImportMaxFileSize: 200,
    imageUploadMaxFileSize: 20,
    api: 'https://sandbox3-api.bosch-refinemysite.com/internal',
    apiAuth: 'https://sandbox3-api.bosch-refinemysite.com',
    features: [
    ],
    projectExportExcelTemplateUrl: 'https://developer-preview.bosch-refinemysite.com/assets/excel/RefinemySiteExcelTemplate.zip',
};
