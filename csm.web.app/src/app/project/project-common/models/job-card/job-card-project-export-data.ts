/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {JobResource} from '../../../../shared/jobs/api/resources/job.resource';
import {JobCardStatusEnum} from '../../enums/job-card-status.enum';
import {
    JOB_CARD_STATUS_MAP,
    JobCardData,
} from './job-card';

export const JOB_PROJECT_EXPORT_CARD_DATA_TITLE_MAP: { [p in JobCardStatusEnum]?: string } = {
    [JobCardStatusEnum.Running]: 'Job_ProjectExportCard_RunningStatusTitle',
    [JobCardStatusEnum.Completed]: 'Job_ProjectExportCard_CompletedStatusTitle',
    [JobCardStatusEnum.Failed]: 'Job_ProjectExportCard_FailedStatusTitle',
};

export class JobCardProjectExportData {
    public static fromJobResource(job: JobResource): JobCardData {
        const {result, status, context: {project: {displayName}}} = job;
        const cardStatus = JOB_CARD_STATUS_MAP[status];
        const title = JOB_PROJECT_EXPORT_CARD_DATA_TITLE_MAP[cardStatus];

        return {
            title,
            read: true,
            status: cardStatus,
            artifactUrl: result?.url,
            description: result?.fileName,
            fileName: result?.fileName,
            projectName: displayName,
        };
    }
}
