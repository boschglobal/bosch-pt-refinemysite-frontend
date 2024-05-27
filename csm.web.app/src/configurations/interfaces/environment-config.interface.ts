/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {FeatureToggleEnum} from '../feature-toggles/feature-toggle.enum';

export interface EnvironmentConfig {
    prodMode: boolean;
    projectImportMaxFileSize: number;
    imageUploadMaxFileSize: number;
    api: string | null;
    apiAuth: string | null;
    features: FeatureToggleEnum[];
    projectExportExcelTemplateUrl: string;
}
