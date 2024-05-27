/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {EnumHelper} from '../../../shared/misc/helpers/enum.helper';

export enum CalendarExportFormatEnum {
    Pdf = 'application/pdf',
    Json = 'application/json',
    Csv = 'text/csv',
}

export const CalendarExportFormatEnumHelper = new EnumHelper('CalendarExportFormatEnum', CalendarExportFormatEnum);
