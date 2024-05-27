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

export const JOB_PROJECT_COPY_CARD_DATA_TITLE_MAP: { [p in JobCardStatusEnum]?: string } = {
    [JobCardStatusEnum.Running]: 'Job_ProjectCopyCard_RunningStatusTitle',
    [JobCardStatusEnum.Completed]: 'Job_ProjectCopyCard_CompletedStatusTitle',
    [JobCardStatusEnum.Failed]: 'Job_ProjectCopyCard_FailedStatusTitle',
};

export class JobCardProjectCopyData {
    public static fromJobResource(job: JobResource): JobCardData {
        const {result, status, context: {project: {displayName}}} = job;
        const cardStatus = JOB_CARD_STATUS_MAP[status];
        const title = JOB_PROJECT_COPY_CARD_DATA_TITLE_MAP[cardStatus];

        return {
            title,
            read: true,
            status: cardStatus,
            description: result?.projectName,
            projectName: displayName,
            rerouteUrl: result?.projectId ? `projects/${result.projectId}/dashboard` : null,
        };
    }
}
