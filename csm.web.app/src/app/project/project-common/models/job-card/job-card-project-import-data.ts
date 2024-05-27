/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {JobResource} from '../../../../shared/jobs/api/resources/job.resource';
import {JobContextProjectImport} from '../../../../shared/jobs/api/resources/job-context-project-import.resource';
import {JobCardStatusEnum} from '../../enums/job-card-status.enum';
import {
    JOB_CARD_STATUS_MAP,
    JobCardData,
} from './job-card';

export const JOB_PROJECT_IMPORT_CARD_DATA_TITLE_MAP: { [p in JobCardStatusEnum]?: string } = {
    [JobCardStatusEnum.Running]: 'Job_ProjectImportCard_RunningStatusTitle',
    [JobCardStatusEnum.Completed]: 'Job_ProjectImportCard_CompletedStatusTitle',
    [JobCardStatusEnum.Failed]: 'Job_ProjectImportCard_FailedStatusTitle',
};

export class JobCardProjectImportData {
    public static fromJobResource(job: JobResource<JobContextProjectImport>): JobCardData {
        const {status, context: {project: {displayName}, fileName}} = job;
        const cardStatus = JOB_CARD_STATUS_MAP[status];
        const title = JOB_PROJECT_IMPORT_CARD_DATA_TITLE_MAP[cardStatus];

        return {
            title,
            read: true,
            status: cardStatus,
            description: fileName,
            projectName: displayName,
        };
    }
}
