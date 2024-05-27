/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {JobStatusEnum} from '../../../../shared/jobs/api/enums/job-status.enum';
import {JobTypeEnum} from '../../../../shared/jobs/api/enums/job-type.enum';
import {JobResource} from '../../../../shared/jobs/api/resources/job.resource';
import {JobCardStatusEnum} from '../../enums/job-card-status.enum';
import {JobCardCalendarExportData} from './job-card-calendar-export-data';
import {JobCardProjectCopyData} from './job-card-project-copy-data';
import {JobCardProjectExportData} from './job-card-project-export-data';
import {JobCardProjectImportData} from './job-card-project-import-data';
import {JobCardProjectRescheduleData} from './job-card-project-reschedule-data';

export class JobCard {
    public id: string;
    public type: JobCardTypesEnum;
    public lastModifiedDate: string;
    public data: JobCardData;

    public static fromJobResource(job: JobResource): JobCard {
        const {id, type, lastModifiedDate} = job;

        switch (type) {
            case JobTypeEnum.CalendarExportCsv:
            case JobTypeEnum.CalendarExportJson:
            case JobTypeEnum.CalendarExportPdf: {
                const data = JobCardCalendarExportData.fromJobResource(job);

                return {
                    id,
                    data,
                    lastModifiedDate,
                    type: JobCardTypesEnum.CalendarExport,
                };
            }
            case JobTypeEnum.ProjectImport: {
                const data = JobCardProjectImportData.fromJobResource(job);

                return {
                    id,
                    data,
                    lastModifiedDate,
                    type: JobCardTypesEnum.ProjectImport,
                };
            }
            case JobTypeEnum.ProjectExportZip:
            case JobTypeEnum.ProjectExport: {
                const data = JobCardProjectExportData.fromJobResource(job);

                return {
                    id,
                    data,
                    lastModifiedDate,
                    type: JobCardTypesEnum.ProjectExport,
                };
            }
            case JobTypeEnum.ProjectCopy: {
                const data = JobCardProjectCopyData.fromJobResource(job);

                return {
                    id,
                    data,
                    lastModifiedDate,
                    type: JobCardTypesEnum.ProjectCopy,
                };
            }
            case JobTypeEnum.ProjectReschedule: {
                const data = JobCardProjectRescheduleData.fromJobResource(job);

                return {
                    id,
                    data,
                    lastModifiedDate,
                    type: JobCardTypesEnum.ProjectReschedule,
                };
            }
            default:
                return null;
        }
    }
}

export enum JobCardTypesEnum {
    CalendarExport = 'CALENDAR_EXPORT',
    ProjectImport = 'PROJECT_IMPORT',
    ProjectExport = 'PROJECT_EXPORT',
    ProjectExportZip = 'PROJECT_EXPORT_ZIP',
    ProjectCopy = 'PROJECT_COPY',
    ProjectReschedule = 'PROJECT_RESCHEDULE',
}

export interface JobCardData {
    title: string;
    description?: string;
    projectName: string;
    read: boolean;
    status: JobCardStatusEnum;
    titleTranslationParams?: { [key: string]: string };
    fileName?: string;
    artifactUrl?: string;
    rerouteUrl?: string;
}

export const JOB_CARD_STATUS_MAP: { [key in JobStatusEnum]: JobCardStatusEnum } = {
    [JobStatusEnum.Queued]: JobCardStatusEnum.Running,
    [JobStatusEnum.Running]: JobCardStatusEnum.Running,
    [JobStatusEnum.Completed]: JobCardStatusEnum.Completed,
    [JobStatusEnum.Failed]: JobCardStatusEnum.Failed,
    [JobStatusEnum.Rejected]: JobCardStatusEnum.Failed,
};
