/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../../shared/misc/helpers/enum.helper';

export enum ProjectExportFormatEnum {
    MSProject = 'MS_PROJECT_XML',
    PrimaveraP6 = 'PRIMAVERA_P6_XML',
    Zip = 'ZIP_ARCHIVE',
}

export const projectExportFormatEnumHelper = new EnumHelper('ProjectExportFormatEnum', ProjectExportFormatEnum);
