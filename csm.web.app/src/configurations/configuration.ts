/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import 'zone.js/plugins/zone-error';

import {EnvironmentConfig} from './interfaces/environment-config.interface';

export const configuration: EnvironmentConfig = {
    prodMode: false,
    projectImportMaxFileSize: 200,
    imageUploadMaxFileSize: 20,
    api: null,
    apiAuth: null,
    features: [],
    projectExportExcelTemplateUrl: '',
};
