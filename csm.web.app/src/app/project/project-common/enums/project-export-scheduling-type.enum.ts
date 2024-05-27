/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../../shared/misc/helpers/enum.helper';

export enum ProjectExportSchedulingTypeEnum {
    AutoScheduled = 'AUTO_SCHEDULED',
    ManuallyScheduled = 'MANUALLY_SCHEDULED',
}

export const projectExportSchedulingTypeEnumHelper = new EnumHelper('ProjectExportSchedulingTypeEnum', ProjectExportSchedulingTypeEnum);
