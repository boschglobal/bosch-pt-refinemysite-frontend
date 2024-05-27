/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

export enum JobTypeEnum {
    CalendarExportPdf = 'CALENDAR_EXPORT_PDF',
    CalendarExportJson = 'CALENDAR_EXPORT_JSON',
    CalendarExportCsv = 'CALENDAR_EXPORT_CSV',
    ProjectImport = 'PROJECT_IMPORT',
    ProjectExport = 'PROJECT_EXPORT',
    ProjectExportZip = 'PROJECT_EXPORT_ZIP',
    ProjectCopy = 'PROJECT_COPY',
    ProjectReschedule = 'PROJECT_RESCHEDULE',
}

export const JOB_TYPES_SUPPORTED: JobTypeEnum[] = [
    JobTypeEnum.CalendarExportPdf,
    JobTypeEnum.CalendarExportJson,
    JobTypeEnum.CalendarExportCsv,
    JobTypeEnum.ProjectImport,
    JobTypeEnum.ProjectExport,
    JobTypeEnum.ProjectExportZip,
    JobTypeEnum.ProjectCopy,
    JobTypeEnum.ProjectReschedule,
];
