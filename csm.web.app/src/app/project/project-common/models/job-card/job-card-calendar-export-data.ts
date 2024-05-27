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
import {FileTypeEnum} from '../../../../shared/misc/enums/file.type.enum';
import {JobCardStatusEnum} from '../../enums/job-card-status.enum';
import {
    JOB_CARD_STATUS_MAP,
    JobCardData,
} from './job-card';

export const JOB_CALENDAR_EXPORT_CARD_DATA_TITLE_MAP: { [p in JobCardStatusEnum]?: string } = {
    [JobCardStatusEnum.Running]: 'Job_CalendarExportCard_RunningStatusTitle',
    [JobCardStatusEnum.Completed]: 'Job_CalendarExportCard_CompletedStatusTitle',
    [JobCardStatusEnum.Failed]: 'Job_CalendarExportCard_FailedStatusTitle',
};

export class JobCardCalendarExportData {
    public static fromJobResource(job: JobResource): JobCardData {
        const {result, status, context: {project: {displayName}}} = job;
        const cardStatus = JOB_CARD_STATUS_MAP[status];
        const title = JOB_CALENDAR_EXPORT_CARD_DATA_TITLE_MAP[cardStatus];
        const fileType = this._getJobCalendarExportDataFileType(job);
        const read = this._isJobCardRead(job);

        return {
            title,
            read,
            status: cardStatus,
            titleTranslationParams: {fileType},
            artifactUrl: result?.url,
            description: result?.fileName,
            fileName: result?.fileName,
            projectName: displayName,
        };
    }

    private static _getJobCalendarExportDataFileType(job: JobResource): FileTypeEnum {
        switch (job.type) {
            case JobTypeEnum.CalendarExportJson:
                return FileTypeEnum.JSON;
            case JobTypeEnum.CalendarExportCsv:
                return FileTypeEnum.CSV;
            case JobTypeEnum.CalendarExportPdf:
                return FileTypeEnum.PDF;
            default:
                return null;
        }
    }

    private static _isJobCardRead(job: JobResource): boolean {
        return job.status !== JobStatusEnum.Completed || job.read;
    }
}
